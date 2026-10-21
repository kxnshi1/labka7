import { afterAll } from "vitest";
import { pool } from "../db/pool.js";
afterAll(async () => {
  await pool.end();
});
