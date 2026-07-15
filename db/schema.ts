import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Tabel `users` — profil anak (sesuai PRD §6 Database Schema).
 * PIN tidak pernah disimpan mentah: kolom `pin_hash` berisi SHA-256
 * dari `${nama-lowercase}:${pin}` (sama dengan format stub frontend,
 * sehingga data localStorage bisa dimigrasikan mulus).
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 30 }).notNull(),
    className: varchar("class_name", { length: 20 }).notNull(),
    schoolName: varchar("school_name", { length: 50 }).notNull(),
    /** Emoji/URL avatar; default bintang. */
    avatarUrl: text("avatar_url").notNull().default("⭐"),
    pinHash: varchar("pin_hash", { length: 64 }).notNull(),
    /** Akumulasi bintang dari semua sesi latihan. */
    totalStars: integer("total_stars").notNull().default(0),
    /** Hitungan PIN salah beruntun — reset saat berhasil masuk. */
    failedAttempts: integer("failed_attempts").notNull().default(0),
    /** Terkunci sampai waktu ini setelah terlalu banyak PIN salah. */
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Nama unik tanpa memandang huruf besar/kecil ("Sinta" == "sinta").
    uniqueIndex("users_name_lower_idx").on(sql`lower(${table.name})`),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Tabel `user_stickers` — stiker yang sudah ditukar anak (PRD: Toko Stiker).
 * Satu baris = satu kepemilikan; kombinasi (user_id, sticker_id) unik
 * agar stiker yang sama tidak terbeli dua kali.
 */
export const userStickers = pgTable(
  "user_stickers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** id stiker dari katalog (mis. "kucing", "panda"). */
    stickerId: varchar("sticker_id", { length: 40 }).notNull(),
    /** Harga bintang saat ditukar (untuk hitung total belanja). */
    priceStars: integer("price_stars").notNull(),
    acquiredAt: timestamp("acquired_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("user_stickers_user_sticker_idx").on(
      table.userId,
      table.stickerId,
    ),
  ],
);

export type UserSticker = typeof userStickers.$inferSelect;
export type NewUserSticker = typeof userStickers.$inferInsert;
