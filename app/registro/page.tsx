import type { Metadata } from "next";
import { RegistroForm } from "@/components/auth/RegistroForm";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate gratis en ArriendoSeguro",
};

export default function RegistroPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            Arriendo<span className="text-[#34D399]">Seguro</span>
          </Link>
          <p className="text-blue-200 mt-2 text-sm">Sin tarjeta de crédito · Gratis para empezar</p>
        </div>
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Crear cuenta</h1>
          <p className="text-sm text-[#64748B] mb-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#1E40AF] font-semibold hover:underline">Inicia sesión</Link>
          </p>
          <RegistroForm />
        </div>
      </div>
    </div>
  );
}
