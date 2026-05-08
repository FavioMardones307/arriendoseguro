import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Gestiona tus arriendos en ArriendoSeguro",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar fijo en desktop */}
      <DashboardSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
