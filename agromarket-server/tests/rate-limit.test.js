import { it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
it("шестой неудачный вход блокируется, есть Retry-After", async () => {
  for (let i = 0; i < 5; i++)
    await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent-rate-limit@test.kz", password: "wrong" })
      .expect(401);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "nonexistent-rate-limit@test.kz", password: "wrong" })
    .expect(429);
  expect(Number(res.headers["retry-after"])).toBeGreaterThan(0);
});
