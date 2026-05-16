"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { consultarDeudaUniredClient } from "@/lib/servicios/unired-client";
import { toast } from "sonner";

interface SyncUtilityButtonProps {
  accountId: string;
  proveedor: string;
  numeroCliente: string;
}

export function SyncUtilityButton({ accountId, proveedor, numeroCliente }: SyncUtilityButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const resultado = await consultarDeudaUniredClient(proveedor, numeroCliente);

      const res = await fetch("/api/utilities/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          monto: resultado.monto,
          vencimiento: resultado.vencimiento,
          saldo_anterior: resultado.saldo_anterior,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      toast.success(
        resultado.monto === 0
          ? "Servicio al día ✓"
          : `Deuda: $${new Intl.NumberFormat("es-CL").format(resultado.monto)}`
      );
      window.location.reload();
    } catch (error: any) {
      toast.error("No se pudo consultar Unired: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
        isSyncing
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95"
      }`}
    >
      {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
      {isSyncing ? "Consultando..." : "Actualizar deuda"}
    </button>
  );
}
