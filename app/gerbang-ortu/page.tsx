import type { Metadata } from "next";
import { Suspense } from "react";
import ParentalGateChallenge from "@/components/ParentalGateChallenge";

export const metadata: Metadata = {
  title: "Khusus Orang Dewasa — Bintang Berhitung",
};

export default function ParentalGatePage() {
  return (
    // Suspense diperlukan karena komponen membaca useSearchParams.
    <Suspense>
      <ParentalGateChallenge />
    </Suspense>
  );
}
