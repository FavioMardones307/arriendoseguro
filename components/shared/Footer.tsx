import Link from "next/link";
import { Home, MessageCircle, Mail, Phone } from "lucide-react";

export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 px-4">
      <div className="container-app">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Marca */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-[#1E40AF] rounded-lg flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              Arriendo<span className="text-[#10B981]">Seguro</span>
            </Link>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
              La plataforma chilena que digitaliza la relación entre propietarios
              y arrendatarios. Legal, seguro y sin comisiones.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#1ea855] transition-colors"
                aria-label="Contactar por WhatsApp"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="font-semibold text-white mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              {[
                { href: "/propietarios", label: "Para propietarios" },
                { href: "/arrendatarios", label: "Para arrendatarios" },
                { href: "/#precios", label: "Precios" },
                { href: "/legal", label: "Centro Legal" },
                { href: "/login", label: "Iniciar sesión" },
                { href: "/registro", label: "Crear cuenta" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              {[
                { href: "/legal/terminos", label: "Términos de servicio" },
                { href: "/legal/privacidad", label: "Política de privacidad" },
                { href: "/legal/cookies", label: "Política de cookies" },
                { href: "/legal/ley-18101", label: "Ley 18.101 (Arriendos)" },
                { href: "/legal/ley-21461", label: "Ley 21.461 (Garantías)" },
                { href: "/legal/ley-21719", label: "Ley 21.719 (Datos)" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#10B981] shrink-0" />
                <a href="mailto:hola@arriendoseguro.cl" className="hover:text-white transition-colors">
                  hola@arriendoseguro.cl
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#10B981] shrink-0" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="text-[#10B981] shrink-0" />
                <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp soporte
                </a>
              </li>
            </ul>

            <div className="mt-6 p-3 bg-[#1E293B] rounded-lg text-xs text-[#64748B]">
              <p className="font-semibold text-[#94A3B8] mb-1">ArriendoSeguro SpA</p>
              {/* TODO: Completar con RUT empresa real */}
              <p>RUT: 77.XXX.XXX-X</p>
              <p>Santiago, Chile</p>
            </div>
          </div>
        </div>

        {/* Medios de pago */}
        <div className="border-t border-[#1E293B] pt-8 mb-6">
          <p className="text-xs text-[#64748B] mb-3 text-center">Medios de pago disponibles</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-[#94A3B8]">
            {["Webpay Plus", "Mach", "Transferencia bancaria", "Flow.cl"].map((mp) => (
              <span key={mp} className="bg-[#1E293B] px-3 py-1.5 rounded-lg border border-[#334155] font-medium">
                {mp}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#1E293B] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {anio} ArriendoSeguro SpA. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con ❤️ en Santiago, Chile 🇨🇱
          </p>
        </div>
      </div>
    </footer>
  );
}
