import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/middleware.test.js", "tests/database-guard.test.js"],
    env: { NODE_ENV: "test", JWT_SECRET: "unit-test-only-secret" },
  },
});
