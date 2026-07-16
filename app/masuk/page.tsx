import type { Metadata } from "next";
import AuthFlow from "@/components/AuthFlow";

export const metadata: Metadata = {
  title: "Masuk — Bintang Berhitung",
};

export default function MasukPage() {
  return <AuthFlow />;
}
