"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, type UserProfile } from "@/lib/users";

export default function HomePage() {
  // null = belum dicek (hindari hydration mismatch), lalu user atau "guest".
  const [user, setUser] = useState<UserProfile | null | "guest">(null);

  useEffect(() => {
    setUser(getCurrentUser() ?? "guest");
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="animate-float-slow text-7xl" aria-hidden>
        ⭐
      </div>
      <h1 className="text-4xl font-extrabold text-sky-deep drop-shadow-sm sm:text-5xl">
        Bintang Berhitung
      </h1>

      {user === null && (
        <p className="text-lg font-semibold text-night/50">Memuat… ✨</p>
      )}

      {user === "guest" && (
        <>
          <p className="max-w-md text-lg font-semibold text-night/70">
            Ayo latihan perkalian dan pembagian angka 1 sampai 10! Kenalan dulu
            yuk, biar bintang-bintangmu tersimpan! 🎒
          </p>
          <Link
            href="/masuk"
            className="btn-pop bg-coral px-10 py-5 text-2xl hover:bg-coral-deep"
          >
            🚀 Mulai Petualangan
          </Link>
        </>
      )}

      {user !== null && user !== "guest" && (
        <>
          <p className="text-xl font-extrabold text-night/80">
            Halo, {user.avatar} {user.name}!
          </p>
          <p className="-mt-6 text-sm font-bold text-night/50">
            Kelas {user.className} • {user.schoolName}
          </p>

          <div className="grid w-full gap-5 sm:grid-cols-2">
            <Link
              href="/latihan/perkalian"
              className="btn-pop flex-col gap-1 bg-coral py-8 hover:bg-coral-deep"
            >
              <span className="text-5xl" aria-hidden>
                ✖️
              </span>
              <span className="text-2xl">Perkalian</span>
              <span className="text-sm font-semibold opacity-90">
                1 × 1 sampai 10 × 10
              </span>
            </Link>
            <Link
              href="/latihan/pembagian"
              className="btn-pop flex-col gap-1 bg-grape py-8 hover:bg-grape-deep"
            >
              <span className="text-5xl" aria-hidden>
                ➗
              </span>
              <span className="text-2xl">Pembagian</span>
              <span className="text-sm font-semibold opacity-90">
                hasil 1 sampai 10
              </span>
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="btn-pop bg-mint px-8 hover:bg-mint-deep"
          >
            📊 Dashboard Nilai
          </Link>
        </>
      )}
    </main>
  );
}
