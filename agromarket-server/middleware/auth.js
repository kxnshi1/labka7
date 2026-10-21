import jwt from "jsonwebtoken";
export function requireAuth(req, res, next) {
  const match = /^Bearer (\S+)$/i.exec(req.headers.authorization || "");
  if (!match)
    return res.status(401).json({ error: "Требуется вход в систему" });
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = { id: Number(payload.sub), role: payload.role };
  } catch (error) {
    return res
      .status(401)
      .json({
        error:
          error.name === "TokenExpiredError"
            ? "Срок действия токена истёк"
            : "Недействительный токен",
      });
  }
  next();
}
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role)
      return res.status(403).json({ error: "Недостаточно прав" });
    next();
  };
}
