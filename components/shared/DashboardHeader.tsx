"use client";

import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-4">
        {/* Búsqueda */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2">
          <Search size={15} className="text-[#94A3B8] shrink-0" />
          <input
            type="search"
            placeholder="Buscar propiedad, contrato..."
            className="bg-transparent text-sm text-[#374151] placeholder:text-[#94A3B8] outline-none w-full"
            aria-label="Buscar"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notificaciones */}
          <button
            className="relative p-2 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-colors"
            aria-label="Ver notificaciones"
          >
            <Bell size={18} />
            {/* Badge de notificaciones no leídas */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" aria-hidden="true" />
          </button>

          {/* Perfil */}
          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              aria-haspopup="true"
              aria-expanded={menuAbierto}
              aria-label="Menú de perfil"
            >
              <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                U
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#374151] max-w-[120px] truncate">
                Usuario Demo
              </span>
              <ChevronDown size={14} className={`text-[#94A3B8] transition-transform ${menuAbierto ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {menuAbierto && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E2E8F0] z-20 py-1 animate-scale-in">
                  <div className="px-4 py-3 border-b border-[#E2E8F0]">
                    <p className="text-sm font-semibold text-[#0F172A]">Usuario Demo</p>
                    <p className="text-xs text-[#64748B]">propietario@demo.cl</p>
                  </div>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-colors"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <User size={15} /> Mi perfil
                  </Link>
                  <Link
                    href="/configuracion"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-colors"
                    onClick={() => setMenuAbierto(false)}
                  >
                    <Settings size={15} /> Configuración
                  </Link>
                  <hr className="my-1 border-[#E2E8F0]" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
