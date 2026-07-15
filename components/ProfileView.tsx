"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getOwnedStickers,
  getStarBalance,
  STICKER_CATALOG,
  type Sticker,
} from "@/lib/stickers";
import { loadSessionResults } from "@/lib/storage";
import { getCurrentUser, type UserProfile } from "@/lib/users";

export default function ProfileView() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [owned, setOwned] = useState<Sticker[]>([]);
  const [stats, setStats] = useState({ earned: 0, balance: 0, sessions: 0 });

  useEffect(() => {
    setUser(getCurrentUser());
    const ownedIds = new Set(getOwnedStickers());
    setOwned(STICKER_CATALOG.filter((s) => ownedIds.has(s.id)));
    const sessions = loadSessionResults();
    setStats({
      earned: sessions.reduce((sum, s) => sum + s.stars, 0),
      balance: getStarBalance(),
      sessions: sessions.length,
    });
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Membuka profil… 🧒
      </div>
    );
  }

  const collectionPct = Math.round(
    (owned.length / STICKER_CATALOG.length) * 100,
  );

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>
        <h1 className="text-2xl font-extrabold text-sky-deep sm:text-3xl">
          🧒 Profilku
        </h1>
      </div>

      {/* Kartu identitas anak */}
      <section className="flex items-center gap-4 rounded-3xl bg-white/85 p-5 shadow-pop">
        <div className="text-6xl" aria-hidden>
          {user.avatar}
        </div>
        <div>
          <div className="text-2xl font-extrabold text-night">{user.name}</div>
          <div className="text-sm font-bold text-night/50">
            Kelas {user.className} • {user.schoolName}
          </div>
        </div>
      </section>

      {/* Statistik bintang */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { emoji: "⭐", value: stats.earned, label: "Total Bintang" },
          { emoji: "💰", value: stats.balance, label: "Bintang Tersisa" },
          { emoji: "📚", value: stats.sessions, label: "Sesi Latihan" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 rounded-3xl bg-white/85 px-3 py-4 text-center shadow-pop-sm"
          >
            <span className="text-2xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="text-2xl font-extrabold text-night">
              {s.value}
            </span>
            <span className="text-[11px] font-bold text-night/50">
              {s.label}
            </span>
          </div>
        ))}
      </section>

      {/* Koleksi Stiker */}
      <section className="rounded-3xl bg-white/85 p-5 shadow-pop">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-night">
            🏅 Koleksi Stiker
          </h2>
          <span className="text-sm font-bold text-night/50">
            {owned.length}/{STICKER_CATALOG.length} ({collectionPct}%)
          </span>
        </div>

        {owned.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-5xl grayscale" aria-hidden>
              🎁
            </span>
            <p className="font-semibold text-night/50">
              Belum ada stiker. Ayo kumpulkan bintang dan tukar di Toko Stiker!
            </p>
            <Link
              href="/toko-stiker"
              className="btn-pop bg-sunshine text-night hover:bg-sunshine-dark"
            >
              🛍️ Ke Toko Stiker
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {owned.map((sticker, i) => (
                <motion.div
                  key={sticker.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", bounce: 0.5 }}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-mint/15 p-3 text-center"
                >
                  <span className="text-4xl" aria-hidden>
                    {sticker.emoji}
                  </span>
                  <span className="text-[11px] font-bold text-night/60">
                    {sticker.name}
                  </span>
                </motion.div>
              ))}
            </div>
            <Link
              href="/toko-stiker"
              className="mt-4 block text-center text-sm font-bold text-sky-deep underline underline-offset-4"
            >
              🛍️ Tukar stiker lain di Toko Stiker
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
