"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message.includes("Invalid login")
          ? "Email o contraseña incorrectos. Intenta de nuevo."
          : "Error al iniciar sesión. Por favor intenta más tarde."
      );
      setCargando(false);
      return;
    }

    // Obtener perfil para saber el rol
    const { data: { user } } = await supabase.auth.getUser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("rol")
      .eq("id", user?.id ?? "")
      .single();

    const destino = profile?.rol === "arrendatario" ? "/arrendatario" : "/propietario";
    router.push(destino);
    router.refresh();
  }

  async function handleGoogle() {
    setCargando(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3 text-sm font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
        aria-label="Continuar con Google"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center text-xs text-[#94A3B8]">
          <span className="bg-white px-3">o con email</span>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="login-email" className="label">Correo electrónico</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-base"
          placeholder="tu@email.cl"
          required
          autoComplete="email"
          aria-required="true"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="login-password" className="label !mb-0">Contraseña</label>
          <Link href="/recuperar" className="text-xs text-[#1E40AF] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={mostrarPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base pr-10"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            aria-required="true"
          />
          <button
            type="button"
            onClick={() => setMostrarPass(!mostrarPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#374151]"
            aria-label={mostrarPass ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando || !email || !password}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Iniciar sesión"
      >
        {cargando ? (
          <><Loader2 size={16} className="animate-spin" /> Iniciando sesión...</>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );
}
