// Exact database name; 'test' in a password or hostname must not authorize DROP.
export function assertTestDatabase(env = process.env) {
  if (env.NODE_ENV !== "test") throw new Error("NODE_ENV должен быть test");
  let url;
  try {
    url = new URL(env.DATABASE_URL);
  } catch {
    throw new Error("Нужен корректный DATABASE_URL тестовой базы");
  }
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    decodeURIComponent(url.pathname) !== "/agromarket_test" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Разрешена только база agromarket_test без параметров URL");
  }
  return url;
}
