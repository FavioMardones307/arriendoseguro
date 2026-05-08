import type { Metadata } from "next";
import { ContratoWizard } from "@/components/contracts/ContratoWizard";

export const metadata: Metadata = { title: "Nuevo Contrato" };

export default function NuevoContratoPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Nuevo contrato de arriendo</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Completa los pasos. El contrato se genera según la Ley 18.101 y la Ley 21.461.
        </p>
      </div>
      <ContratoWizard />
    </div>
  );
}
