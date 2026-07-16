"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ScoreChart from "@/components/ScoreChart";
import { MODE_LABELS, type MathMode } from "@/lib/questions";
import { loadSessionResults, type SessionResult } from "@/lib/storage";

type Filter = "semua" | MathMode;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "perkalian", label: "✖️ Perkalian" },
  { value: "pembagian", label: "➗ Pembagian" },
];

function StatTile({
  emoji,
  value,
  label,
  delay,
}: {
  emoji: string;
  value: string | number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-1 rounded-3xl bg-white/85 px-4 py-5 text-center shadow-pop"
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-3xl font-extrabold text-night">{value}</span>
      <span className="text-xs font-bold text-night/55">{label}</span>
    </motion.div>
  );
}

export default function DashboardView() {
  // Baca localStorage di useEffect agar tidak kena hydration mismatch.
  const [sessions, setSessions] = useState<SessionResult[] | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");

  useEffect(() => {
    setSessions(loadSessionResults());
  }, []);

  const filtered = useMemo(() => {
    if (!sessions) return [];
    return filter === "semua"
      ? sessions
      : sessions.filter((s) => s.mode === filter);
  }, [sessions, filter]);

  const stats = useMemo(() => {
    const totalStars = filtered.reduce((sum, s) => sum + s.stars, 0);
    const totalCorrect = filtered.reduce((sum, s) => sum + s.correct, 0);
    const totalQuestions = filtered.reduce((sum, s) => sum + s.total, 0);
    const avgScore =
      filtered.length === 0
        ? 0
        : Math.round(
            filtered.reduce((sum, s) => sum + s.score, 0) / filtered.length,
          );
    return { totalStars, totalCorrect, totalQuestions, avgScore };
  }, [filtered]);

  if (sessions === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Membuka dashboard… 📊
      </div>
    );
  }

  // ---------- Belum ada sesi sama sekali ----------
  if (sessions.length === 0) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="animate-float-slow text-7xl" aria-hidden>
          📊
        </div>
        <h1 className="text-3xl font-extrabold text-sky-deep">
          Dashboard Nilai
        </h1>
        <p className="max-w-sm text-lg font-semibold text-night/60">
          Belum ada latihan yang selesai. Ayo kerjakan latihan pertamamu dan
          kumpulkan bintang! ⭐
        </p>
        <div className="flex gap-3">
          <Link
            href="/latihan/perkalian"
            className="btn-pop bg-coral hover:bg-coral-deep"
          >
            ✖️ Mulai Perkalian
          </Link>
          <Link href="/" className="btn-pop bg-sky hover:bg-sky-deep">
            🏠 Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>
        <h1 className="text-2xl font-extrabold text-sky-deep sm:text-3xl">
          📊 Dashboard Nilai
        </h1>
      </div>

      {/* Filter satu baris di atas grafik */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
              filter === f.value
                ? "bg-sky-deep text-white shadow-pop-sm"
                : "bg-white/70 text-night/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ringkasan Nilai + Koleksi Bintang */}
      <section
        aria-label="Ringkasan nilai"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatTile
          emoji="⭐"
          value={stats.totalStars}
          label="Koleksi Bintang"
          delay={0}
        />
        <StatTile
          emoji="🎯"
          value={stats.avgScore}
          label="Rata-rata Nilai"
          delay={0.06}
        />
        <StatTile
          emoji="✅"
          value={`${stats.totalCorrect}/${stats.totalQuestions}`}
          label="Soal Benar"
          delay={0.12}
        />
        <StatTile
          emoji="📚"
          value={filtered.length}
          label="Sesi Latihan"
          delay={0.18}
        />
      </section>

      {/* Grafik Kemajuan */}
      <section
        aria-label="Grafik kemajuan"
        className="rounded-3xl bg-white/85 p-5 shadow-pop"
      >
        <h2 className="mb-2 text-lg font-extrabold text-night">
          Grafik Kemajuan Nilai
        </h2>
        <ScoreChart sessions={filtered} />
      </section>

      {/* Riwayat Sesi — sekaligus tampilan tabel dari data grafik */}
      <section
        aria-label="Riwayat sesi"
        className="rounded-3xl bg-white/85 p-5 shadow-pop"
      >
        <h2 className="mb-3 text-lg font-extrabold text-night">
          Riwayat Sesi
        </h2>
        {filtered.length === 0 ? (
          <p className="py-6 text-center font-semibold text-night/50">
            Belum ada sesi {filter !== "semua" ? MODE_LABELS[filter] : ""} —
            ayo latihan dulu! 💪
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...filtered]
              .reverse()
              .slice(0, 20)
              .map((s, i) => (
                <li
                  key={`${s.finishedAt}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {s.mode === "perkalian" ? "✖️" : "➗"}
                    </span>
                    <div>
                      <div className="font-extrabold text-night">
                        {MODE_LABELS[s.mode]} {s.topic}
                      </div>
                      <div className="text-xs font-semibold text-night/50">
                        {new Date(s.finishedAt).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        • {s.correct}/{s.total} benar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-sunshine-dark">
                      ⭐ {s.stars}
                    </span>
                    <span className="w-12 rounded-xl bg-white px-2 py-1 text-center text-lg font-extrabold text-night">
                      {s.score}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
