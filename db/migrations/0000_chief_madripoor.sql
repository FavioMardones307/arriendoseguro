CREATE TYPE "public"."canal_notificacion" AS ENUM('email', 'push', 'whatsapp', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."estado_contrato" AS ENUM('borrador', 'firmado', 'vigente', 'terminado', 'en_disputa');--> statement-breakpoint
CREATE TYPE "public"."estado_item" AS ENUM('bueno', 'regular', 'malo');--> statement-breakpoint
CREATE TYPE "public"."estado_pago" AS ENUM('pendiente', 'pagado', 'atrasado', 'en_disputa', 'condonado');--> statement-breakpoint
CREATE TYPE "public"."habitacion" AS ENUM('exterior', 'hall', 'living', 'cocina', 'dormitorio_principal', 'dormitorio_secundario', 'bano_principal', 'bano_secundario', 'logia', 'terraza', 'bodega', 'medidores');--> statement-breakpoint
CREATE TYPE "public"."metodo_pago" AS ENUM('flow', 'transferencia', 'efectivo', 'otro');--> statement-breakpoint
CREATE TYPE "public"."moneda" AS ENUM('CLP', 'UF');--> statement-breakpoint
CREATE TYPE "public"."nivel_score" AS ENUM('excelente', 'bueno', 'regular', 'precaucion', 'sin_datos');--> statement-breakpoint
CREATE TYPE "public"."plan_suscripcion" AS ENUM('free', 'propietario_premium', 'arrendatario_premium');--> statement-breakpoint
CREATE TYPE "public"."responsable_servicio" AS ENUM('arrendador', 'arrendatario');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('arrendador', 'arrendatario', 'ambos', 'admin');--> statement-breakpoint
CREATE TYPE "public"."tipo_contrato" AS ENUM('plazo_fijo', 'mes_a_mes', 'indefinido');--> statement-breakpoint
CREATE TYPE "public"."tipo_inventario" AS ENUM('entrega', 'salida', 'intermedio');--> statement-breakpoint
CREATE TYPE "public"."tipo_propiedad" AS ENUM('casa', 'departamento', 'pieza', 'oficina', 'local', 'bodega', 'estacionamiento');--> statement-breakpoint
CREATE TYPE "public"."tipo_reajuste" AS ENUM('ipc_semestral', 'ipc_anual', 'uf', 'sin_reajuste');--> statement-breakpoint
CREATE TYPE "public"."tipo_score_evento" AS ENUM('pago_puntual', 'pago_atrasado', 'referencia', 'dicom', 'ingreso_verificado', 'duracion_arriendo', 'pago_servicio', 'contrato_terminado_anticipado');--> statement-breakpoint
CREATE TYPE "public"."tipo_servicio" AS ENUM('luz', 'agua', 'gas', 'internet', 'gastos_comunes');--> statement-breakpoint
CREATE TABLE "arriendo_score" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrendatario_id" uuid NOT NULL,
	"score" integer DEFAULT 300 NOT NULL,
	"nivel" "nivel_score" DEFAULT 'sin_datos' NOT NULL,
	"breakdown" jsonb DEFAULT '{}' NOT NULL,
	"calculado_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"accion" text NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" text,
	"meta" jsonb,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"arrendador_id" uuid NOT NULL,
	"arrendatario_id" uuid NOT NULL,
	"codeudor_id" uuid,
	"monto" numeric(12, 2) NOT NULL,
	"moneda" "moneda" DEFAULT 'CLP' NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"tipo" "tipo_contrato" NOT NULL,
	"garantia_meses" integer DEFAULT 1 NOT NULL,
	"dia_pago" integer DEFAULT 5 NOT NULL,
	"reajuste" "tipo_reajuste" DEFAULT 'sin_reajuste' NOT NULL,
	"permite_mascotas" boolean DEFAULT false NOT NULL,
	"pdf_url" text,
	"firma_arrendador_at" timestamp with time zone,
	"firma_arrendatario_at" timestamp with time zone,
	"audit_trail" jsonb DEFAULT '[]' NOT NULL,
	"estado" "estado_contrato" DEFAULT 'borrador' NOT NULL,
	"clausulas_adicionales" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "economic_indicators" (
	"fecha" date PRIMARY KEY NOT NULL,
	"uf" numeric(10, 2) NOT NULL,
	"ipc" numeric(6, 4) NOT NULL,
	"utm" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"tipo" "tipo_inventario" NOT NULL,
	"fecha" date NOT NULL,
	"firmada_arrendador" boolean DEFAULT false NOT NULL,
	"firmada_arrendatario" boolean DEFAULT false NOT NULL,
	"pdf_url" text,
	"ots_proof_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"habitacion" "habitacion" NOT NULL,
	"nombre" text NOT NULL,
	"estado" "estado_item" NOT NULL,
	"notas" text,
	"medidor_lectura" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"url" text NOT NULL,
	"sha256" text NOT NULL,
	"exif" jsonb,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"taken_at" timestamp with time zone,
	"ots_proof" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titulo" text NOT NULL,
	"categoria" text NOT NULL,
	"contenido_md" text NOT NULL,
	"actualizado_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legal_documents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"canal" "canal_notificacion" NOT NULL,
	"tipo" text NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"enviada_at" timestamp with time zone,
	"leida_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"periodo" date NOT NULL,
	"monto_esperado" numeric(12, 2) NOT NULL,
	"monto_pagado" numeric(12, 2),
	"fecha_pago" timestamp with time zone,
	"metodo" "metodo_pago",
	"flow_token" text,
	"comprobante_url" text,
	"estado" "estado_pago" DEFAULT 'pendiente' NOT NULL,
	"dias_atraso" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"rut" text,
	"nombre" text,
	"apellido" text,
	"telefono" text,
	"rol" "rol" DEFAULT 'arrendatario' NOT NULL,
	"verificado" boolean DEFAULT false NOT NULL,
	"clave_unica_verified" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_rut_unique" UNIQUE("rut")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"direccion" text NOT NULL,
	"numero" text,
	"depto" text,
	"comuna" text NOT NULL,
	"region" text NOT NULL,
	"tipo" "tipo_propiedad" NOT NULL,
	"metros_cuadrados" numeric(8, 2),
	"dormitorios" integer,
	"banos" integer,
	"amoblada" boolean DEFAULT false NOT NULL,
	"valor_uf" numeric(8, 2) NOT NULL,
	"rol_avaluo" text,
	"descripcion" text,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arrendatario_id" uuid NOT NULL,
	"tipo" "tipo_score_evento" NOT NULL,
	"peso" integer NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"servicio" "tipo_servicio" NOT NULL,
	"proveedor" text,
	"monto" numeric(12, 2) NOT NULL,
	"periodo" date NOT NULL,
	"comprobante_url" text,
	"responsable" "responsable_servicio" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "plan_suscripcion" DEFAULT 'free' NOT NULL,
	"flow_subscription_id" text,
	"vigente_hasta" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"aceptado" boolean NOT NULL,
	"version_documento" text NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arriendo_score" ADD CONSTRAINT "arriendo_score_arrendatario_id_profiles_id_fk" FOREIGN KEY ("arrendatario_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_arrendador_id_profiles_id_fk" FOREIGN KEY ("arrendador_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_arrendatario_id_profiles_id_fk" FOREIGN KEY ("arrendatario_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_codeudor_id_profiles_id_fk" FOREIGN KEY ("codeudor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_photos" ADD CONSTRAINT "inventory_photos_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_events" ADD CONSTRAINT "score_events_arrendatario_id_profiles_id_fk" FOREIGN KEY ("arrendatario_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_payments" ADD CONSTRAINT "service_payments_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "arriendo_score_arrendatario_idx" ON "arriendo_score" USING btree ("arrendatario_id");--> statement-breakpoint
CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_entidad_idx" ON "audit_log" USING btree ("entidad","entidad_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contracts_arrendador_idx" ON "contracts" USING btree ("arrendador_id");--> statement-breakpoint
CREATE INDEX "contracts_arrendatario_idx" ON "contracts" USING btree ("arrendatario_id");--> statement-breakpoint
CREATE INDEX "contracts_property_idx" ON "contracts" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "contracts_estado_idx" ON "contracts" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "inventories_contract_idx" ON "inventories" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "inventory_items_inventory_idx" ON "inventory_items" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "inventory_photos_item_idx" ON "inventory_photos" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_leida_idx" ON "notifications" USING btree ("leida_at");--> statement-breakpoint
CREATE INDEX "payments_contract_idx" ON "payments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "payments_estado_idx" ON "payments" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "payments_periodo_idx" ON "payments" USING btree ("periodo");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_rut_idx" ON "profiles" USING btree ("rut");--> statement-breakpoint
CREATE INDEX "properties_owner_idx" ON "properties" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "properties_comuna_idx" ON "properties" USING btree ("comuna");--> statement-breakpoint
CREATE INDEX "score_events_arrendatario_idx" ON "score_events" USING btree ("arrendatario_id");--> statement-breakpoint
CREATE INDEX "score_events_tipo_idx" ON "score_events" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "service_payments_contract_idx" ON "service_payments" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "user_consents_user_idx" ON "user_consents" USING btree ("user_id");