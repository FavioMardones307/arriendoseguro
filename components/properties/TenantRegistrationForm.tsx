"use client";

import { useState } from "react";
import { User, Mail, CreditCard, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { registerTenantAction } from "@/lib/actions/properties";

interface TenantRegistrationFormProps {
  propertyId: string;
}

export function TenantRegistrationForm({ propertyId }: TenantRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await registerTenantAction(propertyId, formData);
      if (result.success) {
        toast.success("Arrendatario registrado. Se ha enviado la invitación por correo.");
        setShowForm(false);
        // Recargar la página para ver los cambios
        window.location.reload();
      } else {
        toast.error(result.error || "Error al registrar");
      }
    } catch (error: any) {
      toast.error("Error inesperado: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="btn-primary w-full justify-center gap-2"
      >
        <User size={18} /> Registrar Arrendatario
      </button>
    );
  }

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> Datos del Arrendatario
        </h4>
        <button 
          onClick={() => setShowForm(false)}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
        >
          Cancelar
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              name="nombre" 
              required 
              className="input-base pl-10 py-2 text-sm" 
              placeholder="Ej: Juan Pérez"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">RUT</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                name="rut" 
                required 
                className="input-base pl-10 py-2 text-sm" 
                placeholder="12.345.678-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                name="email" 
                type="email" 
                required 
                className="input-base pl-10 py-2 text-sm" 
                placeholder="juan@email.com"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full justify-center gap-2 mt-2"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <><Send size={16} /> Confirmar y Enviar Invitación</>
          )}
        </button>
        <p className="text-[9px] text-slate-500 text-center italic">
          * El arrendatario recibirá un link para unirse a la propiedad.
        </p>
      </form>
    </div>
  );
}
