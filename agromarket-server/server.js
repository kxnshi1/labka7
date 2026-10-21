import "dotenv/config";
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "CHANGE_ME")
  throw new Error("Задайте JWT_SECRET в .env");
const { default: app } = await import("./app.js");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`АгроМаркет API: http://localhost:${PORT}`));
