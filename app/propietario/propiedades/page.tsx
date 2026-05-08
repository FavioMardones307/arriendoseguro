import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Building2, MapPin, BedDouble, Bath, CheckCircle2, XCircle } from "lucide-react";
import { formatearUF } from "@/lib/chile/format";

export const metadata: Metadata = { title: "Mis Propiedades" };

const mockPropiedades = [
  {
    id: "1", tipo: "departamento", direccion: "Av. Providencia 1234, Dpto 501",
    comuna: "Providencia", dormitorios: 2, banos: 1, metros: 60,
    valor_uf: 19.4, activa: true, tiene_contrato: true,
    arrendatario: "María González",
  },
  {
    id: "2", tipo: "casa", direccion: "Los Leones 456, Casa 3",
    comuna: "Las Condes", dormitorios: 3, banos: 2, metros: 110,
    valor_uf: 22.4, activa: true, tiene_contrato: true,
    arrendatario: "Carlos Muñoz",
  },
  {
    id: "3", tipo: "departamento", direccion: "Ñuñoa 789, Dpto 302",
    comuna: "Ñuñoa", dormitorios: 1, banos: 1, metros: 42,
    valor_uf: 13.4, activa: true, tiene_contrato: false,
    arrendatario: null,
  },
];

export default function PropiedadesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Mis propiedades</h1>
          <p className="text-[#64748B] text-sm mt-0.5">{mockPropiedades.length} propiedades registradas</p>
        </div>
        <Link href="/propietario/propiedades/nueva" className="btn-primary text-sm">
          <Plus size={16} /> Nueva propiedad
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockPropiedades.map((p) => (
          <div key={p.id} className="card group hover:shadow-lg transition-shadow">
            {/* Header de la card */}
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#1E40AF]" />
              </div>
              {p.tiene_contrato ? (
                <span className="badge badge-success flex items-center gap-1">
                  <CheckCircle2 size={11} /> Arrendada
                </span>
              ) : (
                <span className="badge badge-neutral flex items-center gap-1">
                  <XCircle size={11} /> Disponible
                </span>
              )}
            </div>

            {/* Info */}
            <h2 className="font-semibold text-[#0F172A] text-sm leading-snug mb-1 line-clamp-2">{p.direccion}</h2>
            <div className="flex items-center gap-1 text-xs text-[#64748B] mb-3">
              <MapPin size={11} /> {p.comuna}
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-xs text-[#64748B] mb-3">
              <span className="flex items-center gap-1"><BedDouble size={12} /> {p.dormitorios} dorm.</span>
              <span className="flex items-center gap-1"><Bath size={12} /> {p.banos} baño(s)</span>
              <span>{p.metros} m²</span>
            </div>

            {/* Valor */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
              <div>
                <p className="text-lg font-bold text-[#1E40AF]">{formatearUF(p.valor_uf)}</p>
                {p.arrendatario && <p className="text-xs text-[#64748B]">{p.arrendatario}</p>}
              </div>
              <Link href={`/propietario/propiedades/${p.id}`}
                className="text-xs text-[#1E40AF] font-medium hover:underline">
                Ver detalle →
              </Link>
            </div>
          </div>
        ))}

        {/* Card agregar */}
        <Link href="/propietario/propiedades/nueva"
          className="card border-dashed border-2 border-[#CBD5E1] flex flex-col items-center justify-center gap-3 py-10 hover:border-[#1E40AF] hover:bg-[#F8FAFC] transition-all group">
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center group-hover:bg-[#DBEAFE] transition-colors">
            <Plus size={22} className="text-[#94A3B8] group-hover:text-[#1E40AF]" />
          </div>
          <span className="text-sm font-medium text-[#64748B] group-hover:text-[#1E40AF]">Agregar propiedad</span>
        </Link>
      </div>
    </div>
  );
}
