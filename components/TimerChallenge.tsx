"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  MODE_LABELS,
  randomQuestion,
  type MathMode,
  type Question,
} from "@/lib/questions";
import { playCheer, playFanfare, playWomp } from "@/lib/sounds";
import { saveTimerResult } from "@/lib/timer";

const DURATION = 60; // detik

type Phase = "ready" | "playing" | "done";

export default function TimerChallenge({ mode }: { mode: MathMode }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const deadlineRef = useRef<number>(0);

  const label = MODE_LABELS[mode];

  const nextQuestion = useCallback(() => {
    setQuestion(randomQuestion(mode));
    setInput("");
  }, [mode]);

  const start = () => {
    setCorrect(0);
    setWrong(0);
    setTimeLeft(DURATION);
    deadlineRef.current = Date.now() + DURATION * 1000;
    nextQuestion();
    setPhase("playing");
  };

  // Hitung mundur berbasis deadline (akurat walau tab jeda sebentar).
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const remain = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setTimeLeft(remain);
      if (remain <= 0) setPhase("done");
    };
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  // Simpan skor bonus (stub) sekali saat selesai.
  useEffect(() => {
    if (phase !== "done") return;
    playFanfare();
    saveTimerResult({
      mode,
      correct,
      wrong,
      finishedAt: new Date().toISOString(),
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(() => {
    if (phase !== "playing" || !question || input === "") return;
    if (Number(input) === question.answer) {
      setCorrect((c) => c + 1);
      setFlash("ok");
      playCheer();
    } else {
      setWrong((w) => w + 1);
      setFlash("err");
      playWomp();
    }
    window.setTimeout(() => setFlash(null), 250);
    nextQuestion();
  }, [phase, question, input, nextQuestion]);

  const pressDigit = (d: string) => {
    if (phase !== "playing") return;
    setInput((v) => (v.length >= 3 ? v : v + d));
  };

  // Keyboard fisik.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (/^[0-9]$/.test(e.key)) pressDigit(e.key);
      else if (e.key === "Backspace") setInput((v) => v.slice(0, -1));
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, submit]);

  // ---------- Layar siap ----------
  if (phase === "ready") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="animate-wiggle text-7xl" aria-hidden>
          ⏱️
        </div>
        <h1 className="text-3xl font-extrabold text-sky-deep">
          {label} Kilat
        </h1>
        <p className="font-semibold text-night/60">
          Jawab soal {label.toLowerCase()} sebanyak-banyaknya dalam{" "}
          <b>60 detik</b>! Setiap jawaban benar dapat bintang bonus. Siap? ⚡
        </p>
        <button
          type="button"
          onClick={start}
          className="btn-pop bg-coral px-10 py-5 text-2xl hover:bg-coral-deep"
        >
          🚀 Mulai!
        </button>
        <Link
          href="/timer"
          className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/60 shadow-pop-sm"
        >
          ← Pilih mode lain
        </Link>
      </main>
    );
  }

  // ---------- Layar hasil ----------
  if (phase === "done") {
    const bonus = correct; // 1 bintang bonus / jawaban benar
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className="text-8xl"
          aria-hidden
        >
          {correct >= 15 ? "🏆" : correct >= 8 ? "🌟" : "⚡"}
        </motion.div>
        <h1 className="text-3xl font-extrabold text-sky-deep">Waktu Habis!</h1>
        <div className="w-full rounded-3xl bg-white/85 p-6 shadow-pop">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-4xl font-extrabold text-mint-deep">
                {correct}
              </div>
              <div className="text-sm font-bold text-night/60">Benar</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-coral-deep">
                {wrong}
              </div>
              <div className="text-sm font-bold text-night/60">Salah</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-sunshine/25 py-3 text-lg font-extrabold text-sunshine-dark">
            ⭐ +{bonus} bintang bonus!
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={start}
            className="btn-pop flex-1 bg-coral hover:bg-coral-deep"
          >
            🔁 Main Lagi
          </button>
          <Link href="/timer" className="btn-pop flex-1 bg-sky hover:bg-sky-deep">
            ⏱️ Mode Lain
          </Link>
          <Link href="/" className="btn-pop flex-1 bg-grape hover:bg-grape-deep">
            🏠 Beranda
          </Link>
        </div>
      </main>
    );
  }

  // ---------- Layar bermain ----------
  const urgent = timeLeft <= 10;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 py-6">
      {/* Timer + skor */}
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex items-center gap-1 rounded-2xl px-4 py-2 font-extrabold shadow-pop-sm ${
            urgent
              ? "animate-wiggle bg-coral text-white"
              : "bg-white/85 text-sky-deep"
          }`}
          aria-label={`Sisa waktu ${timeLeft} detik`}
        >
          ⏱️ {timeLeft}s
        </div>
        <div className="flex-1">
          <div className="h-3 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${urgent ? "bg-coral" : "bg-mint"}`}
              style={{ width: `${(timeLeft / DURATION) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-2xl bg-white/85 px-4 py-2 font-extrabold text-mint-deep shadow-pop-sm">
          ✅ {correct}
        </div>
      </div>

      {/* Kartu soal */}
      <motion.div
        animate={{
          backgroundColor:
            flash === "ok" ? "#e7f7f0" : flash === "err" ? "#fdeee9" : "#ffffff",
        }}
        className="relative rounded-3xl border-b-8 border-sky-deep p-8 text-center shadow-pop"
      >
        {question && (
          <div className="text-5xl font-extrabold text-night sm:text-6xl">
            {question.left} {question.symbol} {question.right} ={" "}
            <span className="inline-block min-w-[2ch] rounded-2xl bg-sky/15 px-2 text-sky-deep">
              {input || "?"}
            </span>
          </div>
        )}
        <AnimatePresence>
          {flash && (
            <motion.div
              key={`${flash}-${correct}-${wrong}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-5xl"
              aria-hidden
            >
              {flash === "ok" ? "⭐" : "❌"}
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
          onClick={() => setInput((v) => v.slice(0, -1))}
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
          disabled={input === ""}
          className="btn-pop bg-mint py-4 text-xl hover:bg-mint-deep disabled:opacity-40"
        >
          ✅
        </button>
      </div>
    </main>
  );
}
