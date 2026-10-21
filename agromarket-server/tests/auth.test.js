import { describe, it, expect } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app.js";
import { pool } from "../db/pool.js";
import { uniqueEmail, getUserToken, bearer } from "./helpers.js";
const user = () => ({
  name: "Тест",
  email: uniqueEmail(),
  password: "Test12345!",
});
describe("Регистрация", () => {
  it("создаёт user с JWT, не раскрывает хэш", async () => {
    const data = user();
    const res = await request(app)
      .post("/api/auth/register")
      .send(data)
      .expect(201);
    expect(res.body.user.role).toBe("user");
    expect(res.body.user).not.toHaveProperty("password_hash");
    expect(res.body.token.split(".")).toHaveLength(3);
    const { rows } = await pool.query(
      "SELECT password_hash FROM users WHERE id=$1",
      [res.body.user.id],
    );
    expect(rows[0].password_hash).not.toBe(data.password);
    expect(await bcrypt.compare(data.password, rows[0].password_hash)).toBe(
      true,
    );
  });
  it("role admin в теле игнорируется", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...user(), role: "admin" })
      .expect(201);
    expect(res.body.user.role).toBe("user");
  });
  it("повторный email: 409", async () => {
    const data = user();
    await request(app).post("/api/auth/register").send(data).expect(201);
    await request(app).post("/api/auth/register").send(data).expect(409);
  });
  it("короткий пароль: 400", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ ...user(), password: "123" })
      .expect(400);
  });
  it("email нормализуется", async () => {
    const data = { ...user(), email: uniqueEmail("UPPER").toUpperCase() };
    const res = await request(app)
      .post("/api/auth/register")
      .send(data)
      .expect(201);
    expect(res.body.user.email).toBe(data.email.toLowerCase());
  });
  it("пустые поля: 400", async () => {
    await request(app).post("/api/auth/register").send({}).expect(400);
  });
});
describe("Вход и профиль", () => {
  it("администратор получает JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      })
      .expect(200);
    expect(res.body.user.role).toBe("admin");
    expect(res.body.token.split(".")).toHaveLength(3);
    expect(res.body.user).not.toHaveProperty("password_hash");
  });
  it("неверный пароль и неизвестный email: одинаковые 401", async () => {
    const a = await request(app)
      .post("/api/auth/login")
      .send({ email: process.env.ADMIN_EMAIL, password: "wrong" })
      .expect(401);
    const b = await request(app)
      .post("/api/auth/login")
      .send({ email: uniqueEmail(), password: "wrong" })
      .expect(401);
    expect(a.body).toEqual(b.body);
  });
  it("пустой вход: 400", async () => {
    await request(app).post("/api/auth/login").send({}).expect(400);
  });
  it("профиль без токена: 401", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });
  it("профиль покупателя безопасен", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", bearer(await getUserToken()))
      .expect(200);
    expect(res.body.role).toBe("user");
    expect(res.body).not.toHaveProperty("password_hash");
  });
});
