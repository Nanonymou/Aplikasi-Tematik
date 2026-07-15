import type { Metadata, Viewport } from "next";
import MusicController from "@/components/MusicController";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bintang Berhitung — Belajar Perkalian & Pembagian",
  description:
    "Aplikasi latihan perkalian dan pembagian angka 1 sampai 10 yang seru untuk anak sekolah dasar. Kumpulkan bintang sebanyak-banyaknya!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#58c9f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <MusicController />
        {children}
      </body>
    </html>
  );
}
