"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/users";

/**
 * Penjaga rute sisi client: anak harus sudah masuk (punya profil aktif)
 * sebelum membuka halaman latihan atau dashboard. Kalau belum, dialihkan
 * ke /masuk.
 *
 * Guard ini juga bagian dari reset state total saat Switch User:
 * ia terus memantau perubahan sesi — kalau akun keluar/berganti dari tab
 * lain (event `storage`) atau saat tab kembali fokus, halaman yang butuh
 * login langsung ditendang ke /masuk dan komponen di dalamnya di-remount
 * (state lama tidak bocor ke anak berikutnya).
 */
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Simpan id pengguna aktif sebagai key remount saat akun berganti.
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const user = getCurrentUser();
      if (user) {
        setActiveUserId(user.id);
      } else {
        setActiveUserId(null);
        router.replace("/masuk");
      }
    };

    check();
    // Reset lintas-tab: `storage` terpicu saat tab lain mengubah localStorage.
    window.addEventListener("storage", check);
    // Jaga-jaga saat kembali ke tab ini setelah ganti akun di tempat lain.
    window.addEventListener("focus", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", check);
    };
  }, [router]);

  if (!activeUserId) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Memeriksa… 🔑
      </div>
    );
  }

  // key = id pengguna → ganti akun berarti seluruh subtree di-mount ulang
  // dengan state segar (skor, filter, dan input kembali ke awal).
  return <div key={activeUserId}>{children}</div>;
}
