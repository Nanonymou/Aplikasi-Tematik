import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";
import DashboardView from "@/components/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard Nilai — Bintang Berhitung",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardView />
    </AuthGuard>
  );
}
