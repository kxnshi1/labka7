import { beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { getUserToken, getAdminToken, bearer } from "./helpers.js";
let buyer, admin;
const product = { name: "Тестовый мёд", price: 2500, unit: "кг" };
beforeAll(async () => {
  buyer = bearer(await getUserToken());
  admin = bearer(await getAdminToken());
});
describe("Защита каталога", () => {
  it("POST без токена: 401", async () => {
    await request(app).post("/api/products").send(product).expect(401);
  });
  it("POST покупателя: 403", async () => {
    await request(app)
      .post("/api/products")
      .set("Authorization", buyer)
      .send(product)
      .expect(403);
  });
  it("чужая подпись: 401", async () => {
    const token = jwt.sign({ sub: "1", role: "admin" }, "wrong-secret");
    await request(app)
      .post("/api/products")
      .set("Authorization", bearer(token))
      .send(product)
      .expect(401);
  });
  it("админ: создать, изменить, удалить, проверить 404", async () => {
    const a = await request(app)
      .post("/api/products")
      .set("Authorization", admin)
      .send(product)
      .expect(201);
    const path = `/api/products/${a.body.id}`;
    const b = await request(app)
      .put(path)
      .set("Authorization", admin)
      .send({ ...product, price: 2700 })
      .expect(200);
    expect(b.body.price).toBe(2700);
    await request(app).delete(path).set("Authorization", admin).expect(204);
    await request(app).get(path).expect(404);
  });
  it("DELETE покупателя: 403", async () => {
    await request(app)
      .delete("/api/products/1")
      .set("Authorization", buyer)
      .expect(403);
  });
  it("PUT покупателя: 403", async () => {
    await request(app)
      .put("/api/products/1")
      .set("Authorization", buyer)
      .send(product)
      .expect(403);
  });
  it("администратор получает 400 при отрицательной цене", async () => {
    await request(app)
      .post("/api/products")
      .set("Authorization", admin)
      .send({ ...product, price: -1 })
      .expect(400);
  });
});
describe("Заявки", () => {
  it("без токена: 401", async () => {
    await request(app).get("/api/orders").expect(401);
  });
  it("покупатель: 403", async () => {
    await request(app)
      .get("/api/orders")
      .set("Authorization", buyer)
      .expect(403);
  });
  it("администратор получает массив", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", admin)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it("публичная заявка и смена статуса администратором", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ name: "Заказчик", email: "orders@test.kz", quantity: 10 })
      .expect(201);
    const path = `/api/orders/${res.body.id}`;
    await request(app)
      .patch(path)
      .set("Authorization", buyer)
      .send({ status: "done" })
      .expect(403);
    const updated = await request(app)
      .patch(path)
      .set("Authorization", admin)
      .send({ status: "done" })
      .expect(200);
    expect(updated.body.status).toBe("done");
  });
  it("объём меньше 10: 400", async () => {
    await request(app)
      .post("/api/orders")
      .send({ name: "Тест", email: "a@test.kz", quantity: 1 })
      .expect(400);
  });
});
