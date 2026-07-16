"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { markGatePassed } from "@/lib/parentalGate";

/** Tujuan redirect yang diizinkan setelah lolos gate (anti open-redirect). */
const ALLOWED_TARGETS = new Set(["/pengaturan", "/laporan"]);

interface Challenge {
  nonce: string;
  prompt: string;
  signature: string;
}

/**
 * Tantangan Parental Gate memakai API server:
 * - GET /api/challenge → soal (angka dalam kata, jawaban tak dikirim)
 * - POST /api/challenge/verify → verifikasi + set cookie gate (dipakai middleware)
 */
export default function ParentalGateChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  const target = searchParams.get("ke") ?? "/pengaturan";
  const safeTarget = ALLOWED_TARGETS.has(target) ? target : "/pengaturan";

  const loadChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/challenge", { cache: "no-store" });
      setChallenge(await res.json());
    } catch {
      setChallenge(null);
    }
  }, []);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || input === "" || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nonce: challenge.nonce,
          signature: challenge.signature,
          answer: Number(input),
        }),
      });
      const { ok } = await res.json();
      if (ok) {
        // Tandai juga di sessionStorage untuk GateGuard sisi client.
        markGatePassed();
        router.replace(safeTarget);
        return;
      }
    } catch {
      // jatuh ke penanganan salah di bawah
    }
    // Salah / gagal → soal baru supaya tidak bisa dicoba-coba.
    setWrong(true);
    setInput("");
    await loadChallenge();
    setBusy(false);
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
          disabled={input === "" || !challenge || busy}
          className="btn-pop w-full bg-mint hover:bg-mint-deep disabled:opacity-40"
        >
          {busy ? "Memeriksa…" : "✅ Periksa"}
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
