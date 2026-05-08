"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, ChevronDown } from "lucide-react";

export function Navbar() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
      <nav className="container-app h-16 flex items-center justify-between" aria-label="Navegación principal">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#1E40AF]" aria-label="ArriendoSeguro - Inicio">
          <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span>Arriendo<span className="text-[#10B981]">Seguro</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <div className="relative group">
            <button className="flex items-center gap-1 text-[#374151] hover:text-[#1E40AF] transition-colors" aria-haspopup="true">
              Plataforma <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E2E8F0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2">
              <Link href="/propietarios" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#374151] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-colors">
                Para propietarios
              </Link>
              <Link href="/arrendatarios" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#374151] hover:bg-[#F1F5F9] hover:text-[#1E40AF] transition-colors">
                Para arrendatarios
              </Link>
            </div>
          </div>
          <Link href="/#precios" className="text-[#374151] hover:text-[#1E40AF] transition-colors">Precios</Link>
          <Link href="/legal" className="text-[#374151] hover:text-[#1E40AF] transition-colors">Centro Legal</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-[#374151] hover:text-[#1E40AF] transition-colors px-3 py-2">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="btn-primary text-sm py-2 px-4">
            Crear cuenta gratis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-[#374151] hover:bg-[#F1F5F9] transition-colors"
          onClick={() => setAbierto(!abierto)}
          aria-expanded={abierto}
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {abierto && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-4 py-4 space-y-2 animate-fade-in">
          <Link href="/propietarios" className="block px-3 py-2.5 rounded-lg text-[#374151] hover:bg-[#F1F5F9] font-medium" onClick={() => setAbierto(false)}>
            Para propietarios
          </Link>
          <Link href="/arrendatarios" className="block px-3 py-2.5 rounded-lg text-[#374151] hover:bg-[#F1F5F9] font-medium" onClick={() => setAbierto(false)}>
            Para arrendatarios
          </Link>
          <Link href="/#precios" className="block px-3 py-2.5 rounded-lg text-[#374151] hover:bg-[#F1F5F9] font-medium" onClick={() => setAbierto(false)}>
            Precios
          </Link>
          <Link href="/legal" className="block px-3 py-2.5 rounded-lg text-[#374151] hover:bg-[#F1F5F9] font-medium" onClick={() => setAbierto(false)}>
            Centro Legal
          </Link>
          <hr className="border-[#E2E8F0] my-2" />
          <Link href="/login" className="block px-3 py-2.5 rounded-lg text-[#374151] hover:bg-[#F1F5F9] font-medium" onClick={() => setAbierto(false)}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className="btn-primary w-full justify-center" onClick={() => setAbierto(false)}>
            Crear cuenta gratis
          </Link>
        </div>
      )}
    </header>
  );
}
