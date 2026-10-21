import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { requireRole, requireAuth } from "../middleware/auth.js";
function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}
describe("requireRole unit", () => {
  it("разрешённая роль вызывает next", () => {
    const res = mockRes(),
      next = vi.fn();
    requireRole("admin")({ user: { role: "admin" } }, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
  it("другая роль даёт 403", () => {
    const res = mockRes(),
      next = vi.fn();
    requireRole("admin")({ user: { role: "user" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  it("нет пользователя: 403", () => {
    const res = mockRes(),
      next = vi.fn();
    requireRole("admin")({}, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
describe("requireAuth unit", () => {
  it("нет заголовка: 401", () => {
    const res = mockRes(),
      next = vi.fn();
    requireAuth({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  it("правильный токен заполняет req.user", () => {
    const token = jwt.sign({ sub: "7", role: "user" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } },
      res = mockRes(),
      next = vi.fn();
    requireAuth(req, res, next);
    expect(req.user).toEqual({ id: 7, role: "user" });
    expect(next).toHaveBeenCalledOnce();
  });
  it("истёкший токен: 401 и текст истёк", () => {
    const token = jwt.sign(
      { sub: "7", role: "user", exp: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_SECRET,
    );
    const res = mockRes(),
      next = vi.fn();
    requireAuth({ headers: { authorization: `Bearer ${token}` } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].error).toMatch(/истёк/);
    expect(next).not.toHaveBeenCalled();
  });
  it("сломанный токен не вызывает next", () => {
    const res = mockRes(),
      next = vi.fn();
    requireAuth({ headers: { authorization: "Bearer fake" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
