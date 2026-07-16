import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

/**
 * Klien database (Vercel Postgres + Drizzle).
 * `sql` membaca POSTGRES_URL dari environment saat query pertama,
 * jadi aman diimpor ketika build tanpa database.
 */
export const db = drizzle(sql, { schema });

export * from "./schema";
