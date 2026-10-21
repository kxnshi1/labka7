import pg from "pg";
pg.types.setTypeParser(1082, (value) => value);
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
