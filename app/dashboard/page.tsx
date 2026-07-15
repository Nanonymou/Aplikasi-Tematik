import type { Metadata } from "next";
import DashboardView from "@/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard Nilai — Bintang Berhitung",
};

export default function DashboardPage() {
  return <DashboardView />;
}
