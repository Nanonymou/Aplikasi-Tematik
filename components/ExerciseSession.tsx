"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  generateQuestions,
  MODE_LABELS,
  QUESTIONS_PER_SESSION,
  type MathMode,
  type Question,
} from "@/lib/questions";
import { playCheer, playClick, playFanfare, playWomp } from "@/lib/sounds";
import { saveSessionResult } from "@/lib/storage";

type Feedback = "idle" | "correct" | "wrong";

interface Props {
  mode: MathMode;
  topic: number;
}

const PRAISES_CORRECT = [
  "Hebat! 🎉",
  "Keren banget! 🌟",
  "Pintar! 🥳",
  "Mantap! 💪",
  "Wah, jago! 🚀",
];

const ENCOURAGE_WRONG = [
  "Hampir benar! 💡",
  "Ayo coba lagi! 🌈",
  "Jangan menyerah! 🐣",
  "Sedikit lagi! ✨",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function finalPraise(score: number): { emoji: string; text: string } {
  if (score >= 90) return { emoji: "🏆", text: "Luar biasa! Kamu juara berhitung!" };
  if (score >= 70) return { emoji: "🌟", text: "Hebat! Sedikit lagi sempurna!" };
  if (score >= 50) return { emoji: "💪", text: "Bagus! Terus berlatih ya!" };
  return { emoji: "🌈", text: "Semangat! Ayo coba lagi, pasti bisa!" };
}

export default function ExerciseSession({ mode, topic }: Props) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [feedbackText, setFeedbackText] = useState("");
  /** Soal saat ini sudah pernah dijawab salah (percobaan pertama gagal). */
  const [missedFirstTry, setMissedFirstTry] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [stars, setStars] = useState(0);
  const [finished, setFinished] = useState(false);

  // Soal diacak di client agar tidak kena hydration mismatch.
  useEffect(() => {
    setQuestions(generateQuestions(mode, topic));
  }, [mode, topic]);

  const question = questions?.[index] ?? null;
  const label = MODE_LABELS[mode];

  const goNext = useCallback(() => {
    setInput("");
    setFeedback("idle");
    setFeedbackText("");
    setMissedFirstTry(false);
    if (index + 1 >= QUESTIONS_PER_SESSION) {
      setFinished(true);
      playFanfare();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index]);

  // Simpan hasil sesi (stub localStorage) sekali saat selesai.
  useEffect(() => {
    if (!finished) return;
    saveSessionResult({
      mode,
      topic,
      correct: correctCount,
      total: QUESTIONS_PER_SESSION,
      score: correctCount * 10,
      stars,
      finishedAt: new Date().toISOString(),
    });
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(() => {
    if (!question || feedback === "correct" || input === "") return;
    const value = Number(input);

    if (value === question.answer) {
      setFeedback("correct");
      setFeedbackText(pick(PRAISES_CORRECT));
      playCheer();
      if (!missedFirstTry) {
        setCorrectCount((c) => c + 1);
        setStars((s) => s + 1);
      }
      // Jeda sebentar biar anak menikmati bintangnya, lalu lanjut otomatis.
      window.setTimeout(goNext, 1500);
    } else {
      setFeedback("wrong");
      setFeedbackText(pick(ENCOURAGE_WRONG));
      setMissedFirstTry(true);
      setInput("");
      playWomp();
    }
  }, [question, feedback, input, missedFirstTry, goNext]);

  const pressDigit = useCallback(
    (digit: string) => {
      if (feedback === "correct") return;
      playClick();
      if (feedback === "wrong") setFeedback("idle");
      setInput((v) => (v.length >= 3 ? v : v === "0" ? digit : v + digit));
    },
    [feedback],
  );

  const pressBackspace = useCallback(() => {
    if (feedback === "correct") return;
    playClick();
    setInput((v) => v.slice(0, -1));
  }, [feedback]);

  // Dukungan keyboard fisik (laptop/PC).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
      else if (e.key === "Backspace") pressBackspace();
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressDigit, pressBackspace, submit, finished]);

  const starRow = useMemo(
    () =>
      Array.from({ length: QUESTIONS_PER_SESSION }, (_, i) => i < stars),
    [stars],
  );

  if (!questions || !question) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Menyiapkan soal… ⭐
      </div>
    );
  }

  // ---------- Layar ringkasan akhir ----------
  if (finished) {
    const score = correctCount * 10;
    const praise = finalPraise(score);
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="text-8xl"
          aria-hidden
        >
          {praise.emoji}
        </motion.div>
        <h1 className="text-3xl font-extrabold text-sky-deep sm:text-4xl">
          {praise.text}
        </h1>
        <p className="text-lg font-semibold text-night/60">
          {label} {topic} selesai!
        </p>

        <div className="w-full rounded-3xl bg-white/80 p-6 shadow-pop">
          <div className="mb-3 flex flex-wrap justify-center gap-1 text-3xl">
            {starRow.map((earned, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", bounce: 0.5 }}
                className={earned ? "" : "opacity-25 grayscale"}
                aria-hidden
              >
                ⭐
              </motion.span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-4xl font-extrabold text-sunshine-dark">
                {stars}
              </div>
              <div className="text-sm font-bold text-night/60">Bintang</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-mint-deep">
                {score}
              </div>
              <div className="text-sm font-bold text-night/60">Nilai</div>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-night/50">
            {correctCount} dari {QUESTIONS_PER_SESSION} soal benar
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setQuestions(generateQuestions(mode, topic));
              setIndex(0);
              setInput("");
              setFeedback("idle");
              setFeedbackText("");
              setMissedFirstTry(false);
              setCorrectCount(0);
              setStars(0);
              setFinished(false);
            }}
            className="btn-pop flex-1 bg-coral hover:bg-coral-deep"
          >
            🔁 Ulangi Latihan
          </button>
          <Link
            href={`/latihan/${mode}`}
            className="btn-pop flex-1 bg-sky hover:bg-sky-deep"
          >
            📚 Topik Lain
          </Link>
          <Link href="/" className="btn-pop flex-1 bg-grape hover:bg-grape-deep">
            🏠 Beranda
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-bold text-sky-deep underline underline-offset-4"
        >
          📊 Lihat Dashboard Nilai
        </Link>
      </main>
    );
  }

  // ---------- Layar latihan ----------
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-5 px-5 py-6">
      {/* Bar atas: keluar + progres + bintang */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/latihan/${mode}`}
          className="rounded-2xl bg-white/70 px-3 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Keluar
        </Link>
        <div className="flex-1 rounded-full bg-white/70 p-1.5 shadow-inner">
          <motion.div
            className="h-3 rounded-full bg-mint"
            animate={{ width: `${(index / QUESTIONS_PER_SESSION) * 100}%` }}
            transition={{ type: "spring", bounce: 0 }}
          />
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-white/70 px-3 py-2 font-extrabold text-sunshine-dark shadow-pop-sm">
          ⭐ {stars}
        </div>
      </div>

      <p className="text-center text-sm font-bold text-night/50">
        {label} {topic} • Soal {index + 1} dari {QUESTIONS_PER_SESSION}
      </p>

      {/* Kartu soal */}
      <motion.div
        key={index}
        initial={{ x: 60, opacity: 0 }}
        animate={{
          x: feedback === "wrong" ? [0, -10, 10, -8, 8, 0] : 0,
          opacity: 1,
        }}
        transition={{ duration: feedback === "wrong" ? 0.4 : 0.3 }}
        className={`relative rounded-3xl border-b-8 bg-white p-8 text-center shadow-pop ${
          feedback === "correct"
            ? "border-mint-deep"
            : feedback === "wrong"
              ? "border-coral-deep"
              : "border-sky-deep"
        }`}
      >
        <div className="text-5xl font-extrabold tracking-wide text-night sm:text-6xl">
          {question.left} {question.symbol} {question.right} ={" "}
          <span
            className={`inline-block min-w-[2ch] rounded-2xl px-2 ${
              feedback === "correct"
                ? "bg-mint/20 text-mint-deep"
                : feedback === "wrong"
                  ? "bg-coral/20 text-coral-deep"
                  : "bg-sky/15 text-sky-deep"
            }`}
          >
            {input || "?"}
          </span>
        </div>

        {/* Umpan balik instan */}
        <div className="mt-4 min-h-8">
          <AnimatePresence mode="wait">
            {feedback !== "idle" && (
              <motion.p
                key={feedback + feedbackText}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`text-xl font-extrabold ${
                  feedback === "correct" ? "text-mint-deep" : "text-coral-deep"
                }`}
              >
                {feedbackText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bintang terbang saat benar */}
        <AnimatePresence>
          {feedback === "correct" && (
            <motion.div
              key={`star-${index}`}
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: [0, 1.6, 1], y: -90, opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 text-6xl"
              aria-hidden
            >
              ⭐
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Papan angka */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => pressDigit(d)}
            className="btn-pop bg-sky py-4 text-2xl hover:bg-sky-deep"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={pressBackspace}
          aria-label="Hapus"
          className="btn-pop bg-coral py-4 text-2xl hover:bg-coral-deep"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={() => pressDigit("0")}
          className="btn-pop bg-sky py-4 text-2xl hover:bg-sky-deep"
        >
          0
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={input === "" || feedback === "correct"}
          className="btn-pop bg-mint py-4 text-xl hover:bg-mint-deep disabled:opacity-40"
        >
          Jawab ✅
        </button>
      </div>
    </main>
  );
}
