import type { Metadata } from "next";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Mode Kilat — Bintang Berhitung",
};

/**
 * Pemilih mode untuk Mode Kilat (tantangan 60 detik).
 * Engine tantangannya dibangun pada task berikutnya; halaman ini
 * menyediakan titik masuk agar navigasi dari beranda tidak rusak.
 */
export default function TimerPickerPage() {
  return (
    <AuthGuard>
      <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
        <Link
          href="/"
          className="self-start rounded-2xl bg-white/70 px-4 py-2 text-sm font-bold text-night/70 shadow-pop-sm"
        >
          ← Beranda
        </Link>

        <div className="animate-wiggle text-7xl" aria-hidden>
          ⏱️
        </div>
        <h1 className="text-3xl font-extrabold text-sky-deep sm:text-4xl">
          Mode Kilat
        </h1>
        <p className="max-w-md font-semibold text-night/60">
          Jawab soal sebanyak-banyaknya dalam 60 detik untuk dapat skor bonus!
          Pilih dulu mau berlatih apa. ⚡
        </p>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          <Link
            href="/timer/perkalian"
            className="btn-pop flex-col gap-1 bg-coral py-8 hover:bg-coral-deep"
          >
            <span className="text-5xl" aria-hidden>
              ✖️
            </span>
            <span className="text-2xl">Perkalian Kilat</span>
          </Link>
          <Link
            href="/timer/pembagian"
            className="btn-pop flex-col gap-1 bg-grape py-8 hover:bg-grape-deep"
          >
            <span className="text-5xl" aria-hidden>
              ➗
            </span>
            <span className="text-2xl">Pembagian Kilat</span>
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}
