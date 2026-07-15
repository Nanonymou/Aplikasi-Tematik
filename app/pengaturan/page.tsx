import type { Metadata } from "next";
import Link from "next/link";
import GateGuard from "@/components/GateGuard";

export const metadata: Metadata = {
  title: "Pengaturan — Bintang Berhitung",
};

export default function PengaturanPage() {
  return (
    <GateGuard>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="text-6xl" aria-hidden>
          ⚙️
        </div>
        <h1 className="text-3xl font-extrabold text-sky-deep">Pengaturan</h1>
        <p className="font-semibold text-night/60">
          Pengaturan suara, musik, dan data akan hadir di sini. 🚧
        </p>
        <Link href="/" className="btn-pop bg-sky hover:bg-sky-deep">
          🏠 Beranda
        </Link>
      </main>
    </GateGuard>
  );
}
