CREATE TABLE "utility_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"tipo" "tipo_servicio" NOT NULL,
	"proveedor" text NOT NULL,
	"numero_cliente" text NOT NULL,
	"monto_deuda" numeric(12, 2) DEFAULT '0' NOT NULL,
	"fecha_vencimiento" date,
	"ultima_consulta" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "utility_accounts" ADD CONSTRAINT "utility_accounts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "utility_accounts_property_idx" ON "utility_accounts" USING btree ("property_id");--> statement-breakpoint
CREATE UNIQUE INDEX "utility_accounts_unique_idx" ON "utility_accounts" USING btree ("property_id","tipo","numero_cliente");