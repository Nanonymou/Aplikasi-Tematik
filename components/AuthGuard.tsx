"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/users";

/**
 * Penjaga rute sisi client: anak harus sudah masuk (punya profil aktif)
 * sebelum membuka halaman latihan atau dashboard. Kalau belum, dialihkan
 * ke /masuk.
 */
export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (getCurrentUser()) {
      setAllowed(true);
    } else {
      router.replace("/masuk");
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Memeriksa… 🔑
      </div>
    );
  }

  return <>{children}</>;
}
