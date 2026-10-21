import { it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
it("health: HTTP 200 и подключение к БД", async () => {
  const res = await request(app).get("/api/health");
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ status: "ok", db: "connected" });
  expect(Number.isNaN(Date.parse(res.body.time))).toBe(false);
});
it("неизвестный маршрут: 404", async () => {
  await request(app).get("/missing").expect(404);
});

// watch experiment
