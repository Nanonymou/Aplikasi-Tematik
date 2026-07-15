"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isGatePassed } from "@/lib/parentalGate";

/**
 * Guard navigasi Parental Gate: rute sensitif (Pengaturan, Laporan)
 * hanya bisa dibuka setelah lolos tantangan orang dewasa. Kalau belum,
 * dialihkan ke /gerbang-ortu dengan tujuan kembali ke rute ini.
 */
export default function GateGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isGatePassed()) {
      setAllowed(true);
    } else {
      router.replace(`/gerbang-ortu?ke=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-2xl font-bold text-sky-deep">
        Memeriksa… 🔐
      </div>
    );
  }

  return <>{children}</>;
}
