import { it, expect } from "vitest";
import { assertTestDatabase } from "./assertTestDatabase.js";
it("разрешает только точное имя тестовой БД", () => {
  expect(() =>
    assertTestDatabase({
      NODE_ENV: "test",
      DATABASE_URL:
        "postgres://postgres:password@localhost:5432/agromarket_test",
    }),
  ).not.toThrow();
});
it.each([
  "postgres://postgres:test@localhost/agromarket",
  "postgres://postgres:pw@test-server/agromarket",
  "postgres://postgres:pw@localhost/agromarket_test?dbname=agromarket",
  "not-a-url",
])("запрещает опасную строку %s", (url) => {
  expect(() =>
    assertTestDatabase({ NODE_ENV: "test", DATABASE_URL: url }),
  ).toThrow();
});
it("запрещает запуск не в test", () => {
  expect(() =>
    assertTestDatabase({
      NODE_ENV: "development",
      DATABASE_URL: "postgres://postgres:pw@localhost/agromarket_test",
    }),
  ).toThrow();
});
