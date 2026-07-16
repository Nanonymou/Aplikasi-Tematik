import type { Metadata } from "next";
import GateGuard from "@/components/GateGuard";
import WeeklyReportView from "@/components/WeeklyReportView";

export const metadata: Metadata = {
  title: "Laporan Mingguan — Bintang Berhitung",
};

export default function LaporanPage() {
  return (
    <GateGuard>
      <WeeklyReportView />
    </GateGuard>
  );
}
