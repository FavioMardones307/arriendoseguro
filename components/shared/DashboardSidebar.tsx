"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Building2, FileText, CreditCard, Camera,
  Users, BarChart3, Settings, X, Menu, Scale,
  Star, ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navPropietario: NavItem[] = [
  { href: "/propietario", label: "Resumen", icon: Home },
  { href: "/propietario/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/propietario/contratos", label: "Contratos", icon: FileText },
  { href: "/propietario/pagos", label: "Pagos", icon: CreditCard },
  { href: "/propietario/inventarios", label: "Inventarios", icon: Camera },
  { href: "/propietario/arrendatarios", label: "Arrendatarios", icon: Users },
  { href: "/propietario/reportes", label: "Reportes", icon: BarChart3 },
];

const navArrendatario: NavItem[] = [
  { href: "/arrendatario", label: "Mi Arriendo", icon: Home },
  { href: "/arrendatario/pagos", label: "Mis Pagos", icon: CreditCard },
  { href: "/arrendatario/score", label: "ArriendoScore", icon: Star },
  { href: "/arrendatario/documentos", label: "Documentos", icon: FileText },
  { href: "/legal", label: "Centro Legal", icon: Scale },
];

interface DashboardSidebarProps {
  rol?: "arrendador" | "arrendatario";
}

export function DashboardSidebar({ rol = "arrendador" }: DashboardSidebarProps) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const items = rol === "arrendatario" ? navArrendatario : navPropietario;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#E2E8F0]">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#1E40AF]" onClick={() => setAbierto(false)}>
          <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center shrink-0">
            <Home size={15} className="text-white" />
          </div>
          Arriendo<span className="text-[#10B981]">Seguro</span>
        </Link>
        <span className="text-xs text-[#94A3B8] mt-1 block">
          {rol === "arrendatario" ? "Panel arrendatario" : "Panel propietario"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegación del panel">
        {items.map((item) => {
          const activo = pathname === item.href || (item.href !== "/propietario" && item.href !== "/arrendatario" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAbierto(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                activo
                  ? "bg-[#1E40AF] text-white shadow-sm"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E40AF]"
              }`}
              aria-current={activo ? "page" : undefined}
            >
              <item.icon size={17} className={activo ? "text-white" : "text-[#94A3B8] group-hover:text-[#1E40AF]"} />
              {item.label}
              {activo && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#E2E8F0] space-y-1">
        <Link
          href="/configuracion"
          onClick={() => setAbierto(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-all"
        >
          <Settings size={17} className="text-[#94A3B8]" />
          Configuración
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E2E8F0] z-30 flex-col shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 bg-[#1E40AF] text-white rounded-xl shadow-lg flex items-center justify-center"
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
      >
        {abierto ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile drawer */}
      {abierto && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
