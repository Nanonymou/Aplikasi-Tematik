import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";
import StickerShop from "@/components/StickerShop";

export const metadata: Metadata = {
  title: "Toko Stiker — Bintang Berhitung",
};

export default function TokoStikerPage() {
  return (
    <AuthGuard>
      <StickerShop />
    </AuthGuard>
  );
}
