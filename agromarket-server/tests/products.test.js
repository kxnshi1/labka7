import { it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
it("каталог публичный и непустой", async () => {
  const res = await request(app).get("/api/products").expect(200);
  expect(res.body.length).toBeGreaterThan(0);
});
it("товар содержит id, name, price", async () => {
  const { body } = await request(app).get("/api/products").expect(200);
  expect(body[0]).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      name: expect.any(String),
      price: expect.any(Number),
    }),
  );
});
it("GET по id возвращает тот же товар", async () => {
  const { body } = await request(app).get("/api/products").expect(200);
  const res = await request(app).get(`/api/products/${body[0].id}`).expect(200);
  expect(res.body).toEqual(body[0]);
});
it("несуществующий товар: 404", async () => {
  await request(app).get("/api/products/2147483647").expect(404);
});
it("поиск фильтрует по имени без учёта регистра", async () => {
  const { body } = await request(app).get("/api/products").expect(200);
  const name = body[0].name;
  const found = await request(app)
    .get("/api/products")
    .query({ search: name.toUpperCase() })
    .expect(200);
  expect(found.body.some((p) => p.id === body[0].id)).toBe(true);
  expect(
    found.body.every((p) => p.name.toLowerCase().includes(name.toLowerCase())),
  ).toBe(true);
});
it("неверный id: 400", async () => {
  await request(app).get("/api/products/not-a-number").expect(400);
});
