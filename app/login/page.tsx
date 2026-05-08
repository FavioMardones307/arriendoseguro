import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta en ArriendoSeguro para gestionar tus arriendos.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            Arriendo<span className="text-[#34D399]">Seguro</span>
          </Link>
          <p className="text-blue-200 mt-2 text-sm">Bienvenido de vuelta</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Iniciar sesión</h1>
          <p className="text-sm text-[#64748B] mb-6">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-[#1E40AF] font-semibold hover:underline">
              Créala gratis
            </Link>
          </p>
          <Suspense fallback={<div className="skeleton h-48 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
