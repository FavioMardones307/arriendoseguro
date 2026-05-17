import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  FileText, CreditCard, Camera, Star, ShieldCheck,
  TrendingUp, Clock, CheckCircle, ArrowRight, Zap,
  Building2, Users, Scale
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="gradient-hero text-white pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

        <div className="container-app relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap size={14} className="text-[#34D399]" />
              Hecho en Chile, para Chile 🇨🇱
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Arriendos sin estrés.{" "}
              <span className="text-[#34D399]">Legales, seguros</span> y
              100% digitales.
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Contrato con IA listo en 10 minutos. Cobro automático mensual. Inventario
              certificado. ArriendoScore para postulantes. Todo en una plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro?rol=arrendador" className="btn-accent text-base px-8 py-4">
                Soy propietario
                <ArrowRight size={18} />
              </Link>
              <Link href="/registro?rol=arrendatario" className="inline-flex items-center justify-center gap-2 text-base px-8 py-4 rounded-xl font-semibold border-2 border-white text-white bg-white/15 hover:bg-white hover:text-[#1E40AF] transition-all whitespace-nowrap">
                Soy arrendatario
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/20">
              {[
                { valor: "10 min", label: "para crear un contrato" },
                { valor: "100%", label: "Ley 18.101 cumplida" },
                { valor: "$0", label: "comisión sobre el arriendo" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-[#34D399]">{stat.valor}</div>
                  <div className="text-xs sm:text-sm text-blue-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARA PROPIETARIOS ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="badge badge-info mb-3">Para propietarios</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">
              Gestiona tus propiedades sin complicaciones
            </h2>
            <p className="text-[#64748B] mt-3 max-w-xl mx-auto">
              Olvídate del papel, los depósitos bancarios manuales y los contratos
              desactualizados. Todo en un solo lugar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                color: "#1E40AF",
                bg: "#DBEAFE",
                titulo: "Contrato en 10 min",
                desc: "Wizard con IA basado en Ley 18.101. Firma electrónica incluida. Sin abogado.",
              },
              {
                icon: CreditCard,
                color: "#10B981",
                bg: "#D1FAE5",
                titulo: "Cobro automático",
                desc: "Link de pago mensual por WhatsApp y email. Integrado con Flow, Webpay y Mach.",
              },
              {
                icon: Camera,
                color: "#7C3AED",
                bg: "#EDE9FE",
                titulo: "Inventario blindado",
                desc: "Fotos con firma digital y certificación blockchain. Protección ante disputas.",
              },
              {
                icon: Star,
                color: "#F59E0B",
                bg: "#FEF3C7",
                titulo: "Score de postulantes",
                desc: "Evalúa arrendatarios con ArriendoScore: historial, ingresos y antecedentes.",
              },
            ].map((item) => (
              <div key={item.titulo} className="card group cursor-default">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: item.bg }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{item.titulo}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA ARRENDATARIOS ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F1F5F9]">
        <div className="container-app">
          <div className="text-center mb-12">
            <span className="badge badge-success mb-3">Para arrendatarios</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">
              Tu historial como inquilino vale
            </h2>
            <p className="text-[#64748B] mt-3 max-w-xl mx-auto">
              Construye tu reputación digital, paga desde el celular y accede
              a tu contrato cuando quieras.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: TrendingUp,
                color: "#1E40AF",
                bg: "#DBEAFE",
                titulo: "ArriendoScore portable",
                desc: "Tu puntaje viaja contigo. Muéstralo a futuros propietarios y consigue arriendos más fácil.",
              },
              {
                icon: ShieldCheck,
                color: "#10B981",
                bg: "#D1FAE5",
                titulo: "Paga seguro online",
                desc: "Webpay, Mach o transferencia. Recibo legal con tu RUT en segundos. Sin efectivo.",
              },
              {
                icon: Scale,
                color: "#7C3AED",
                bg: "#EDE9FE",
                titulo: "Biblioteca legal gratis",
                desc: "Tus derechos en simple: garantía, desahucio, reparaciones y más. Chatbot legal IA.",
              },
            ].map((item) => (
              <div key={item.titulo} className="card group cursor-default">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: item.bg }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-2">{item.titulo}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ─────────────────────────────────────────────── */}
      <section id="precios" className="py-20 px-4">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A]">Precios transparentes</h2>
            <p className="text-[#64748B] mt-3">Sin letra chica. Sin comisión sobre tu arriendo.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                plan: "Gratis",
                precio: "$0",
                periodo: "siempre",
                descripcion: "Para empezar",
                color: "#64748B",
                features: [
                  "1 propiedad",
                  "Contrato básico",
                  "Registro de pagos manual",
                  "Centro legal",
                ],
                cta: "Crear cuenta gratis",
                href: "/registro",
                destacado: false,
              },
              {
                plan: "Propietario Premium",
                precio: "$9.990",
                periodo: "CLP/mes por propiedad",
                descripcion: "Lo más popular",
                color: "#1E40AF",
                features: [
                  "Propiedades ilimitadas",
                  "Contratos con IA",
                  "Cobro automático Flow",
                  "Inventario certificado",
                  "Alertas multi-canal",
                  "Reajuste automático IPC/UF",
                  "Reportes tributarios SII",
                ],
                cta: "Comenzar ahora",
                href: "/registro?plan=propietario_premium",
                destacado: true,
              },
              {
                plan: "Arrendatario Premium",
                precio: "$4.990",
                periodo: "CLP/mes",
                descripcion: "Para tu tranquilidad",
                color: "#10B981",
                features: [
                  "ArriendoScore completo",
                  "Verificación de ingresos",
                  "Historial descargable",
                  "Certificado PDF con QR",
                  "Soporte prioritario",
                ],
                cta: "Mejorar mi score",
                href: "/registro?plan=arrendatario_premium",
                destacado: false,
              },
            ].map((item) => (
              <div
                key={item.plan}
                className={`card relative ${item.destacado ? "border-[#1E40AF] border-2 shadow-xl scale-105" : ""}`}
              >
                {item.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E40AF] text-white text-xs font-bold px-4 py-1 rounded-full">
                    MÁS POPULAR
                  </div>
                )}
                <p className="text-sm text-[#64748B] mb-1">{item.descripcion}</p>
                <h3 className="text-xl font-bold text-[#0F172A]">{item.plan}</h3>
                <div className="my-4">
                  <span className="text-3xl font-bold" style={{ color: item.color }}>{item.precio}</span>
                  <span className="text-sm text-[#64748B] ml-1">{item.periodo}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {item.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#374151]">
                      <CheckCircle size={15} className="text-[#10B981] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={item.href}
                  className={item.destacado ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}
                  style={item.destacado ? {} : { borderColor: item.color, color: item.color }}
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARATIVO vs HOUM ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#F1F5F9]">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0F172A]">¿Por qué ArriendoSeguro?</h2>
            <p className="text-[#64748B] mt-2">Comparación honesta con otras plataformas</p>
          </div>

          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1E40AF] text-white">
                  <th className="text-left p-4 font-semibold">Característica</th>
                  <th className="text-center p-4 font-semibold">ArriendoSeguro</th>
                  <th className="text-center p-4 font-semibold text-blue-200">Otras plataformas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Comisión sobre arriendo", "0%", "8-10% mensual"],
                  ["Autogestión total", "✅ Sí", "❌ Requiere agente"],
                  ["Contrato con IA (Ley 18.101)", "✅ Incluido", "❌ Extra o no existe"],
                  ["ArriendoScore verificable", "✅ Portátil", "❌ No existe"],
                  ["Inventario con blockchain", "✅ Sí", "❌ Solo fotos simples"],
                  ["Precios en CLP (sin sorpresas)", "✅ Sí", "⚠️ Variable"],
                  ["Soporte en español de Chile", "✅ Sí", "⚠️ Parcial"],
                ].map(([feature, as, otros], i) => (
                  <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                    <td className="p-4 text-[#374151] font-medium">{feature}</td>
                    <td className="p-4 text-center font-semibold text-[#10B981]">{as}</td>
                    <td className="p-4 text-center text-[#94A3B8]">{otros}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="container-app max-w-2xl">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿El contrato generado tiene validez legal?",
                a: "Sí. Todos los contratos se generan según la Ley 18.101 y la Ley 21.461. La firma electrónica tiene validez bajo la Ley 19.799.",
              },
              {
                q: "¿Cuántos meses de garantía puedo cobrar?",
                a: "Máximo 2 meses de arriendo, tal como lo establece la Ley 21.461. La plataforma no permite configurar un valor mayor.",
              },
              {
                q: "¿Cómo funciona el cobro automático?",
                a: "Integramos con Flow.cl. El arrendatario recibe un link de pago por email y WhatsApp cada mes. Puede pagar con Webpay, Mach o transferencia.",
              },
              {
                q: "¿Qué es el ArriendoScore?",
                a: "Es un puntaje de 0-1000 que refleja el historial de pago, ingresos verificados y antecedentes de un arrendatario. Se construye con el tiempo y con consentimiento explícito.",
              },
              {
                q: "¿Mis datos están seguros?",
                a: "Cumplimos con la Ley 21.719 (protección de datos). Toda la información está cifrada, con auditoría completa y derecho al olvido.",
              },
              {
                q: "¿Puedo usar la plataforma si no tengo RUT?",
                a: "Sí. Puedes registrarte con email y completar el RUT después. Exigimos RUT solo para generar contratos y emitir recibos con validez legal.",
              },
            ].map((item, i) => (
              <details key={i} className="card group cursor-pointer p-0 overflow-hidden">
                <summary className="flex items-center justify-between p-5 font-semibold text-[#0F172A] list-none select-none hover:bg-[#F8FAFC] transition-colors">
                  {item.q}
                  <span className="text-[#1E40AF] text-xl leading-none ml-4 shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────── */}
      <section className="py-20 px-4 gradient-hero text-white text-center">
        <div className="container-app max-w-2xl">
          <Building2 size={48} className="mx-auto mb-4 text-[#34D399]" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Empieza gratis hoy
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Sin tarjeta de crédito. Sin permanencia. Cancela cuando quieras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro?rol=arrendador" className="btn-accent px-8 py-4 text-base">
              Soy propietario <ArrowRight size={18} />
            </Link>
            <Link href="/registro?rol=arrendatario" className="inline-flex items-center justify-center gap-2 text-base px-8 py-4 rounded-xl font-semibold border-2 border-white text-white bg-white/15 hover:bg-white hover:text-[#1E40AF] transition-all whitespace-nowrap">
              Soy arrendatario
            </Link>
          </div>
          <p className="text-xs text-blue-200 mt-6 flex items-center justify-center gap-2">
            <Users size={12} /> Únete a propietarios y arrendatarios que ya gestionan sus arriendos con ArriendoSeguro
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
