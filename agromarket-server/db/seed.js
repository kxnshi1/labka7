import "dotenv/config";
import bcrypt from "bcryptjs";
import { assertTestDatabase } from "../tests/assertTestDatabase.js";
if (process.env.NODE_ENV === "test") assertTestDatabase();
import { readFileSync } from "node:fs";
import { pool } from "./pool.js";
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const { products } = JSON.parse(
  readFileSync(new URL("../data/db.json", import.meta.url), "utf8"),
);
try {
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD.length < 8
  )
    throw new Error(
      "Задайте ADMIN_EMAIL и ADMIN_PASSWORD (минимум 8 символов)",
    );
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(schema);
    for (const p of products)
      await client.query(
        "INSERT INTO products(name,category,price,unit,image) VALUES($1,$2,$3,$4,$5)",
        [
          p.name,
          p.category ?? null,
          Math.round(Number(p.price)),
          p.unit ?? "кг",
          p.image ?? null,
        ],
      );
    await client.query(
      "INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin')",
      ["Администратор", process.env.ADMIN_EMAIL.trim().toLowerCase(), hash],
    );
    await client.query("COMMIT");
    console.log(
      `Готово: таблицы созданы, товаров добавлено — ${products.length}`,
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await pool.end();
}
