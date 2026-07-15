import type { Metadata } from "next";
import GateGuard from "@/components/GateGuard";
import SettingsView from "@/components/SettingsView";

export const metadata: Metadata = {
  title: "Pengaturan — Bintang Berhitung",
};

export default function PengaturanPage() {
  return (
    <GateGuard>
      <SettingsView />
    </GateGuard>
  );
}
