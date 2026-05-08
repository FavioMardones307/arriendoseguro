"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function RegistroForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rol = params.get("rol") ?? "arrendador";
  const supabase = createClient();

  const [rolSeleccionado, setRolSeleccionado] = useState<"arrendador" | "arrendatario">(
    rol === "arrendatario" ? "arrendatario" : "arrendador"
  );
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const fortalezaPass = (() => {
    if (password.length === 0) return 0;
    let pts = 0;
    if (password.length >= 8) pts++;
    if (/[A-Z]/.test(password)) pts++;
    if (/[0-9]/.test(password)) pts++;
    if (/[^A-Za-z0-9]/.test(password)) pts++;
    return pts;
  })();

  const coloresFortaleza = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const etiquetasFortaleza = ["", "Débil", "Regular", "Buena", "Excelente"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fortalezaPass < 2) { setError("Usa una contraseña más segura."); return; }
    setCargando(true);
    setError(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre, rol: rolSeleccionado },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message.includes("already registered")
        ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
        : "Error al crear la cuenta. Intenta de nuevo.");
      setCargando(false);
      return;
    }
    setEnviado(true);
  }

  async function handleGoogle() {
    setCargando(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (enviado) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 size={40} className="text-[#10B981] mx-auto mb-3" />
        <h2 className="font-bold text-[#0F172A] mb-2">¡Revisa tu correo!</h2>
        <p className="text-sm text-[#64748B]">
          Te enviamos un enlace a <strong>{email}</strong> para confirmar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Selección de rol */}
      <div>
        <p className="label">Soy…</p>
        <div className="grid grid-cols-2 gap-2">
          {(["arrendador", "arrendatario"] as const).map((r) => (
            <button key={r} type="button" onClick={() => setRolSeleccionado(r)}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                rolSeleccionado === r ? "border-[#1E40AF] bg-[#DBEAFE] text-[#1E40AF]" : "border-[#E2E8F0] text-[#64748B]"
              }`}>
              {r === "arrendador" ? "🏠 Propietario" : "👤 Arrendatario"}
            </button>
          ))}
        </div>
      </div>

      {/* Google */}
      <button type="button" onClick={handleGoogle} disabled={cargando}
        className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3 text-sm font-medium text-[#374151] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]" /></div>
        <div className="relative flex justify-center text-xs text-[#94A3B8]"><span className="bg-white px-3">o con email</span></div>
      </div>

      <div>
        <label htmlFor="reg-nombre" className="label">Nombre</label>
        <input id="reg-nombre" className="input-base" placeholder="María González" value={nombre}
          onChange={e => setNombre(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="reg-email" className="label">Correo electrónico</label>
        <input id="reg-email" type="email" className="input-base" placeholder="tu@email.cl" value={email}
          onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label htmlFor="reg-password" className="label">Contraseña</label>
        <div className="relative">
          <input id="reg-password" type={mostrarPass ? "text" : "password"} className="input-base pr-10"
            placeholder="Mínimo 8 caracteres" value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
          <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            aria-label={mostrarPass ? "Ocultar" : "Mostrar"}>
            {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: i <= fortalezaPass ? coloresFortaleza[fortalezaPass] : "#E2E8F0" }} />
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: coloresFortaleza[fortalezaPass] }}>
              {etiquetasFortaleza[fortalezaPass]}
            </p>
          </div>
        )}
      </div>

      <button type="submit" disabled={cargando || !email || !password || !nombre}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
        {cargando ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta…</> : "Crear cuenta gratis"}
      </button>

      <p className="text-xs text-center text-[#94A3B8]">
        Al registrarte aceptas nuestros{" "}
        <a href="/legal/terminos" className="text-[#1E40AF] hover:underline">Términos de servicio</a>{" "}
        y{" "}
        <a href="/legal/privacidad" className="text-[#1E40AF] hover:underline">Política de privacidad</a>.
      </p>
    </form>
  );
}
