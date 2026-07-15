"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopicBarChart from "@/components/TopicBarChart";
import {
  buildWeeklyReport,
  type TopicPerformance,
  type WeeklyReport,
} from "@/lib/report";
import { getCurrentUser } from "@/lib/users";

function TopicRow({
  topic,
  tone,
}: {
  topic: TopicPerformance;
  tone: "good" | "warn";
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {topic.mode === "perkalian" ? "✖️" : "➗"}
        </span>
        <div>
          <div className="font-extrabold text-night">{topic.label}</div>
          <div className="text-xs font-semibold text-night/50">
            {topic.attempts}× latihan • nilai terbaik {topic.bestScore}
          </div>
        </div>
      </div>
      <span
        className={`w-14 rounded-xl px-2 py-1 text-center text-lg font-extrabold ${
          tone === "good"
            ? "bg-mint/20 text-mint-deep"
            : "bg-coral/15 text-coral-deep"
        }`}
      >
        {topic.avgScore}
      </span>
    </li>
  );
}

export default function WeeklyReportView() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [childName, setChildName] = useState("");

  useEffect(() => {
    setChildName(getCurrentUser()?.name ?? "");
    setReport(buildWeeklyReport());
  }, []);

  if (!report) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Menyusun laporan… 📈
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>
        <h1 className="text-xl font-extrabold text-sky-deep sm:text-2xl">
          📈 Laporan Mingguan
        </h1>
      </div>

      <p className="text-sm font-semibold text-night/60">
        Ringkasan latihan{childName ? ` ${childName}` : ""} dalam 7 hari
        terakhir untuk Ayah & Ibu.
      </p>

      {report.totalSessions === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/85 p-8 text-center shadow-pop">
          <span className="text-5xl" aria-hidden>
            🗓️
          </span>
          <p className="font-semibold text-night/60">
            Belum ada latihan minggu ini. Ajak si kecil berlatih ya!
          </p>
        </div>
      ) : (
        <>
          {/* Ringkasan angka + perbandingan minggu lalu */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                emoji: "📚",
                value: report.totalSessions,
                label: "Sesi",
                delta: report.delta.sessions,
              },
              {
                emoji: "🎯",
                value: report.avgScore,
                label: "Rata-rata Nilai",
                delta: report.delta.avgScore,
              },
              {
                emoji: "✅",
                value: `${report.correct}/${report.totalQuestions}`,
                label: "Soal Benar",
              },
              {
                emoji: "⭐",
                value: report.totalStars,
                label: "Bintang",
                delta: report.delta.stars,
              },
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
                {s.delta !== undefined &&
                  (report.previous.totalSessions > 0 ? (
                    <span
                      className={`text-[10px] font-bold ${
                        s.delta > 0
                          ? "text-mint-deep"
                          : s.delta < 0
                            ? "text-coral-deep"
                            : "text-night/40"
                      }`}
                    >
                      {s.delta > 0 ? "▲" : s.delta < 0 ? "▼" : "—"}{" "}
                      {Math.abs(s.delta)} vs mgg lalu
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-night/30">
                      minggu pertama
                    </span>
                  ))}
              </div>
            ))}
          </section>

          {/* Grafik nilai per topik */}
          <section className="rounded-3xl bg-white/85 p-5 shadow-pop">
            <h2 className="mb-1 text-lg font-extrabold text-night">
              📊 Nilai per Topik
            </h2>
            <p className="mb-4 text-xs font-semibold text-night/50">
              Rata-rata nilai tiap topik minggu ini. Garis di angka{" "}
              {80} adalah batas dikuasai.
            </p>
            <TopicBarChart topics={report.allTopics} />
          </section>

          {/* Dikuasai */}
          <section className="rounded-3xl bg-white/85 p-5 shadow-pop">
            <h2 className="mb-1 text-lg font-extrabold text-mint-deep">
              🌟 Sudah Dikuasai
            </h2>
            <p className="mb-3 text-xs font-semibold text-night/50">
              Topik dengan rata-rata nilai 80 ke atas.
            </p>
            {report.mastered.length === 0 ? (
              <p className="py-3 text-center text-sm font-semibold text-night/50">
                Belum ada yang dikuasai penuh minggu ini — semangat terus! 💪
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {report.mastered.map((t) => (
                  <TopicRow key={t.label} topic={t} tone="good" />
                ))}
              </ul>
            )}
          </section>

          {/* Butuh latihan */}
          <section className="rounded-3xl bg-white/85 p-5 shadow-pop">
            <h2 className="mb-1 text-lg font-extrabold text-coral-deep">
              💡 Butuh Latihan Tambahan
            </h2>
            <p className="mb-3 text-xs font-semibold text-night/50">
              Topik dengan rata-rata nilai di bawah 60 — ajak berlatih lagi ya.
            </p>
            {report.needsPractice.length === 0 ? (
              <p className="py-3 text-center text-sm font-semibold text-night/50">
                Hebat! Tidak ada topik yang tertinggal minggu ini. 🎉
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {report.needsPractice.map((t) => (
                  <TopicRow key={t.label} topic={t} tone="warn" />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
