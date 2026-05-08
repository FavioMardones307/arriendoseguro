/**
 * Tipos TypeScript generados para la base de datos Supabase
 * Refleja el schema definido en db/schema.ts
 * 
 * TODO: Después de configurar Supabase, regenerar con:
 * npx supabase gen types typescript --project-id TU_PROJECT_ID > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Rol = "arrendador" | "arrendatario" | "ambos" | "admin";
export type TipoPropiedad = "casa" | "departamento" | "pieza" | "oficina" | "local" | "bodega" | "estacionamiento";
export type EstadoContrato = "borrador" | "firmado" | "vigente" | "terminado" | "en_disputa";
export type TipoContrato = "plazo_fijo" | "mes_a_mes" | "indefinido";
export type Moneda = "CLP" | "UF";
export type TipoReajuste = "ipc_semestral" | "ipc_anual" | "uf" | "sin_reajuste";
export type EstadoPago = "pendiente" | "pagado" | "atrasado" | "en_disputa" | "condonado";
export type MetodoPago = "flow" | "transferencia" | "efectivo" | "otro";
export type TipoInventario = "entrega" | "salida" | "intermedio";
export type EstadoItem = "bueno" | "regular" | "malo";
export type NivelScore = "excelente" | "bueno" | "regular" | "precaucion" | "sin_datos";
export type CanalNotificacion = "email" | "push" | "whatsapp" | "in_app";
export type PlanSuscripcion = "free" | "propietario_premium" | "arrendatario_premium";
export type TipoServicio = "luz" | "agua" | "gas" | "internet" | "gastos_comunes";
export type ResponsableServicio = "arrendador" | "arrendatario";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          rut: string | null;
          nombre: string | null;
          apellido: string | null;
          telefono: string | null;
          rol: Rol;
          verificado: boolean;
          clave_unica_verified: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          direccion: string;
          numero: string | null;
          depto: string | null;
          comuna: string;
          region: string;
          tipo: TipoPropiedad;
          metros_cuadrados: number | null;
          dormitorios: number | null;
          banos: number | null;
          amoblada: boolean;
          valor_uf: number;
          rol_avaluo: string | null;
          descripcion: string | null;
          activa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      contracts: {
        Row: {
          id: string;
          property_id: string;
          arrendador_id: string;
          arrendatario_id: string;
          codeudor_id: string | null;
          monto: number;
          moneda: Moneda;
          fecha_inicio: string;
          fecha_fin: string | null;
          tipo: TipoContrato;
          garantia_meses: number;
          dia_pago: number;
          reajuste: TipoReajuste;
          permite_mascotas: boolean;
          pdf_url: string | null;
          firma_arrendador_at: string | null;
          firma_arrendatario_at: string | null;
          audit_trail: Json;
          estado: EstadoContrato;
          clausulas_adicionales: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contracts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["contracts"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          contract_id: string;
          periodo: string;
          monto_esperado: number;
          monto_pagado: number | null;
          fecha_pago: string | null;
          metodo: MetodoPago | null;
          flow_token: string | null;
          comprobante_url: string | null;
          estado: EstadoPago;
          dias_atraso: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      inventories: {
        Row: {
          id: string;
          contract_id: string;
          tipo: TipoInventario;
          fecha: string;
          firmada_arrendador: boolean;
          firmada_arrendatario: boolean;
          pdf_url: string | null;
          ots_proof_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventories"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventories"]["Insert"]>;
      };
      arriendo_score: {
        Row: {
          id: string;
          arrendatario_id: string;
          score: number;
          nivel: NivelScore;
          breakdown: Json;
          calculado_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["arriendo_score"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["arriendo_score"]["Insert"]>;
      };
      economic_indicators: {
        Row: {
          fecha: string;
          uf: number;
          ipc: number;
          utm: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["economic_indicators"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["economic_indicators"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          canal: CanalNotificacion;
          tipo: string;
          payload: Json;
          enviada_at: string | null;
          leida_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: PlanSuscripcion;
          flow_subscription_id: string | null;
          vigente_hasta: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subscriptions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          accion: string;
          entidad: string;
          entidad_id: string | null;
          meta: Json | null;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      rol: Rol;
      tipo_propiedad: TipoPropiedad;
      estado_contrato: EstadoContrato;
      tipo_contrato: TipoContrato;
      moneda: Moneda;
      tipo_reajuste: TipoReajuste;
      estado_pago: EstadoPago;
      metodo_pago: MetodoPago;
      nivel_score: NivelScore;
      canal_notificacion: CanalNotificacion;
      plan_suscripcion: PlanSuscripcion;
    };
  };
}
