export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === "entity.too.large")
    return res.status(413).json({ error: "Слишком большой запрос" });
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ error: "Некорректный JSON в теле запроса" });
  if (err.code === "23505")
    return res.status(409).json({ error: "Такая запись уже существует" });
  if (err.code === "23503")
    return res.status(400).json({ error: "Связанная запись не найдена" });
  if (["23514", "23502", "22P02", "22007", "22008"].includes(err.code))
    return res.status(400).json({ error: "Некорректные данные запроса" });
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
}
