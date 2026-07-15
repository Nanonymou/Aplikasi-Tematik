"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  generateGateChallenge,
  markGatePassed,
  type GateChallenge,
} from "@/lib/parentalGate";

/** Tujuan redirect yang diizinkan setelah lolos gate (anti open-redirect). */
const ALLOWED_TARGETS = new Set(["/pengaturan", "/laporan"]);

/**
 * Tantangan Parental Gate: soal perkalian yang angkanya ditulis dalam
 * kata — mudah untuk orang dewasa, sulit untuk anak kecil.
 */
export default function ParentalGateChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [challenge, setChallenge] = useState<GateChallenge | null>(null);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);

  // Soal dibuat di client agar tidak kena hydration mismatch.
  useEffect(() => {
    setChallenge(generateGateChallenge());
  }, []);

  const target = searchParams.get("ke") ?? "/pengaturan";
  const safeTarget = ALLOWED_TARGETS.has(target) ? target : "/pengaturan";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || input === "") return;
    if (Number(input) === challenge.answer) {
      markGatePassed();
      router.replace(safeTarget);
    } else {
      // Jawaban salah → soal baru supaya tidak bisa dicoba-coba.
      setWrong(true);
      setChallenge(generateGateChallenge());
      setInput("");
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="text-6xl" aria-hidden>
        🧑‍🦱🔐
      </div>
      <h1 className="text-3xl font-extrabold text-sky-deep">
        Khusus Orang Dewasa
      </h1>
      <p className="font-semibold text-night/60">
        Minta bantuan Ayah, Ibu, atau gurumu untuk menjawab soal ini ya!
      </p>

      {wrong && (
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full rounded-2xl bg-coral/15 px-4 py-3 text-sm font-bold text-coral-deep"
          role="alert"
        >
          Jawaban belum tepat — coba soal baru di bawah ini.
        </motion.p>
      )}

      <form
        onSubmit={submit}
        className="flex w-full flex-col items-center gap-4 rounded-3xl bg-white/85 p-6 shadow-pop"
      >
        <p className="text-sm font-bold text-night/50">Berapa hasil dari</p>
        {challenge ? (
          <p className="text-2xl font-extrabold capitalize text-night">
            {challenge.prompt}?
          </p>
        ) : (
          <p className="text-2xl font-extrabold text-night/30">…</p>
        )}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Jawaban"
          placeholder="ketik jawabannya"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="w-full rounded-2xl border-4 border-night/10 bg-white px-4 py-3 text-center text-2xl font-extrabold text-night placeholder:text-base placeholder:font-semibold placeholder:text-night/30 focus:border-sky focus:outline-none"
        />
        <button
          type="submit"
          disabled={input === "" || !challenge}
          className="btn-pop w-full bg-mint hover:bg-mint-deep disabled:opacity-40"
        >
          ✅ Periksa
        </button>
      </form>

      <Link
        href="/"
        className="rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/60 shadow-pop-sm"
      >
        ← Kembali ke Beranda
      </Link>
    </main>
  );
}
