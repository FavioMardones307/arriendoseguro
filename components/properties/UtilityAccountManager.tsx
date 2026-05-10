"use client";

import { useState } from "react";
import { 
  Plus, Trash2, Zap, Droplet, Flame, 
  Loader2, AlertCircle, CheckCircle2,
  Settings2, X
} from "lucide-react";
import { saveUtilityAccount, deleteUtilityAccount } from "@/lib/actions/utilities";
import { toast } from "sonner";

const PROVEEDORES_POR_TIPO: Record<string, string[]> = {
  agua: [
    "Aguas Andinas", "Aguas Cordillera", "Aguas Manquehue", 
    "Essbio", "Esval", "Aguas del Valle", "Aguas Antofagasta", 
    "Aguas Araucanía", "Aguas Magallanes", "Nuevo Sur"
  ],
  luz: [
    "Enel", "CGE S.A.", "Chilquinta", "Saesa", "Frontel", 
    "Luz del Sur", "Edelmag"
  ],
  gas: [
    "Metrogas", "Lipigas", "Abastible", "Gasco", "GasSur"
  ]
};

interface UtilityAccountManagerProps {
  propertyId: string;
  tipo: 'agua' | 'luz' | 'gas';
  variant?: 'button' | 'icon';
  existingAccount?: any;
}

export function UtilityAccountManager({ 
  propertyId, 
  tipo, 
  variant = 'button',
  existingAccount 
}: UtilityAccountManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [proveedor, setProveedor] = useState(existingAccount?.proveedor || "");
  const [numeroCliente, setNumeroCliente] = useState(existingAccount?.numero_cliente || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await saveUtilityAccount({
        property_id: propertyId,
        tipo,
        proveedor,
        numero_cliente: numeroCliente,
        id: existingAccount?.id
      });
      toast.success("Cuenta configurada correctamente");
      setIsOpen(false);
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este monitoreo?")) return;
    setIsDeleting(true);
    try {
      await deleteUtilityAccount(existingAccount.id);
      toast.success("Monitoreo eliminado");
      setIsOpen(false);
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const providers = PROVEEDORES_POR_TIPO[tipo] || [];

  return (
    <>
      {variant === 'button' ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn-secondary w-full py-2 text-xs font-bold gap-2"
        >
          <Plus size={14} /> Configurar cuenta
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
        >
          <Settings2 size={16} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                {tipo === 'agua' ? <Droplet size={18} className="text-blue-500" /> : 
                 tipo === 'luz' ? <Zap size={18} className="text-yellow-500" /> : 
                 <Flame size={18} className="text-orange-500" />}
                Configurar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Empresa Proveedora</label>
                <select 
                  value={proveedor} 
                  onChange={(e) => setProveedor(e.target.value)}
                  required
                  className="input-base"
                >
                  <option value="">Selecciona una empresa…</option>
                  {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="Otra">Otra empresa...</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Número de Cliente</label>
                <input 
                  type="text" 
                  placeholder="Ej: 1234567-8"
                  value={numeroCliente}
                  onChange={(e) => setNumeroCliente(e.target.value)}
                  required
                  className="input-base"
                />
                <p className="text-[10px] text-[#94A3B8]">Lo encuentras en tu boleta física o digital.</p>
              </div>

              <div className="flex gap-3 pt-4">
                {existingAccount && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex-1 justify-center"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
