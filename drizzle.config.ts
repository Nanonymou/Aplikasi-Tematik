import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Vercel Postgres menyediakan POSTGRES_URL secara otomatis di Vercel.
    url: process.env.POSTGRES_URL ?? "",
  },
});
