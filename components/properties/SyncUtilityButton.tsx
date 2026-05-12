"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncUtilityDebtAction } from "@/lib/actions/utilities";
import { toast } from "sonner";

interface SyncUtilityButtonProps {
  accountId: string;
}

export function SyncUtilityButton({ accountId }: SyncUtilityButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncUtilityDebtAction(accountId);
      if (res.success) {
        toast.success(`Deuda actualizada: $${new Intl.NumberFormat("es-CL").format(res.monto || 0)}`);
        // Recargar solo los datos necesarios o la página
        window.location.reload();
      } else {
        toast.error(res.error || "No se pudo sincronizar con Unired");
      }
    } catch (error: any) {
      toast.error("Error técnico: " + error.message);
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
      {isSyncing ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <RefreshCw size={12} />
      )}
      {isSyncing ? "Consultando..." : "Actualizar deuda"}
    </button>
  );
}
