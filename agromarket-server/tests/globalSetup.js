import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { assertTestDatabase } from "./assertTestDatabase.js";
export default function setup() {
  assertTestDatabase();
  if (!process.env.JWT_SECRET) throw new Error("Нужен JWT_SECRET для тестов");
  execFileSync(process.execPath, ["db/seed.js"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: { ...process.env },
    stdio: "inherit",
  });
}
