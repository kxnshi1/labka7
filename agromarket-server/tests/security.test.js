import { it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
it("сломанный JSON: 400", async () => {
  await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);
});
it("JSON более 10kb: 413", async () => {
  await request(app)
    .post("/api/auth/login")
    .send({ email: "a".repeat(12000) })
    .expect(413);
});
it("Helmet запрещает угадывание типа", async () => {
  const res = await request(app).get("/");
  expect(res.headers["x-content-type-options"]).toBe("nosniff");
});
it("CORS отвечает на OPTIONS", async () => {
  const res = await request(app)
    .options("/api/products")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "authorization,content-type")
    .expect(204);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:5173",
  );
  expect(res.headers["access-control-allow-headers"]).toContain(
    "authorization",
  );
});
