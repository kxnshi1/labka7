import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const router = Router();
const adminOnly = [requireAuth, requireRole("admin")];
function validateProduct(b) {
  if (typeof b.name !== "string" || !b.name.trim())
    return "Поле name обязательно";
  const n = Number(b.price);
  if (
    b.price === undefined ||
    b.price === null ||
    b.price === "" ||
    !Number.isInteger(n) ||
    n < 0
  )
    return "Поле price должно быть целым числом ≥ 0";
  return null;
}
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE name ILIKE $1 ORDER BY id",
    [`%${String(req.query.search ?? "")}%`],
  );
  res.json(rows);
});
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id=$1", [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Товар не найден" });
  res.json(rows[0]);
});
router.post("/", adminOnly, async (req, res) => {
  const b = req.body || {},
    error = validateProduct(b);
  if (error) return res.status(400).json({ error });
  const { rows } = await pool.query(
    "INSERT INTO products(name,category,price,unit,image) VALUES($1,$2,$3,$4,$5) RETURNING *",
    [
      b.name,
      b.category ?? null,
      Number(b.price),
      b.unit ?? "кг",
      b.image ?? null,
    ],
  );
  res.status(201).json(rows[0]);
});
router.put("/:id", adminOnly, async (req, res) => {
  const b = req.body || {},
    error = validateProduct(b);
  if (error) return res.status(400).json({ error });
  const { rows } = await pool.query(
    "UPDATE products SET name=$1,category=$2,price=$3,unit=$4,image=$5 WHERE id=$6 RETURNING *",
    [
      b.name,
      b.category ?? null,
      Number(b.price),
      b.unit ?? "кг",
      b.image ?? null,
      req.params.id,
    ],
  );
  if (!rows.length) return res.status(404).json({ error: "Товар не найден" });
  res.json(rows[0]);
});
router.delete("/:id", adminOnly, async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM products WHERE id=$1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Товар не найден" });
  res.status(204).end();
});
export default router;
