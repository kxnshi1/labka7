import { randomUUID } from "node:crypto";
import request from "supertest";
import app from "../app.js";
export const uniqueEmail = (prefix = "user") =>
  `${prefix}-${randomUUID()}@test.kz`;
export async function getUserToken() {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Покупатель", email: uniqueEmail(), password: "Test12345!" })
    .expect(201);
  return res.body.token;
}
export async function getAdminToken() {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })
    .expect(200);
  return res.body.token;
}
export const bearer = (token) => `Bearer ${token}`;
