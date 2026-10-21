import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Слишком много попыток входа. Попробуйте через 15 минут" },
});
function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2h", algorithm: "HS256" },
  );
}
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string"
  )
    return res
      .status(400)
      .json({ error: "Поля name, email и password обязательны" });
  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Пароль должен быть не короче 8 символов" });
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role,created_at",
    [name.trim(), email.trim().toLowerCase(), hash],
  );
  res.status(201).json({ user: rows[0], token: createToken(rows[0]) });
});
router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  )
    return res.status(400).json({ error: "Email и пароль обязательны" });
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [
    email.trim().toLowerCase(),
  ]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Неверный email или пароль" });
  const { password_hash, ...safeUser } = user;
  res.json({ user: safeUser, token: createToken(user) });
});
router.get("/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id,name,email,role,created_at FROM users WHERE id=$1",
    [req.user.id],
  );
  if (!rows.length)
    return res.status(404).json({ error: "Пользователь не найден" });
  res.json(rows[0]);
});
export default router;
