import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";
import ProfileView from "@/components/ProfileView";

export const metadata: Metadata = {
  title: "Profilku — Bintang Berhitung",
};

export default function ProfilPage() {
  return (
    <AuthGuard>
      <ProfileView />
    </AuthGuard>
  );
}
