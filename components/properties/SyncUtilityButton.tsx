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
      className={`p-2 rounded-lg transition-all flex items-center justify-center ${
        isSyncing 
          ? "bg-blue-50 text-blue-400" 
          : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95"
      }`}
      title="Actualizar deuda desde Unired"
    >
      {isSyncing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <RefreshCw size={16} />
      )}
    </button>
  );
}
