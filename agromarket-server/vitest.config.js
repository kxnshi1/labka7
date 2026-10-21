import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
// CI supplies variables itself. Locally use only the dedicated test file.
if (!process.env.CI)
  dotenv.config({
    path: fileURLToPath(new URL(".env.test", import.meta.url)),
    override: true,
    quiet: true,
  });
export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    globalSetup: ["./tests/globalSetup.js"],
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      include: ["app.js", "routes/**/*.js", "middleware/**/*.js"],
      reporter: ["text", "json", "json-summary", "html"],
      reportsDirectory: "coverage",
    },
  },
});
