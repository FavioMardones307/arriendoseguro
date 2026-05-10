/**
 * Schema Drizzle ORM para ArriendoSeguro
 * PostgreSQL en Supabase con RLS habilitado en todas las tablas
 * 
 * Ejecutar migraciones:
 *   npm run db:generate
 *   npm run db:push
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  decimal,
  integer,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const rolEnum = pgEnum("rol", [
  "arrendador",
  "arrendatario",
  "ambos",
  "admin",
]);

export const tipoPropiedadEnum = pgEnum("tipo_propiedad", [
  "casa",
  "departamento",
  "pieza",
  "oficina",
  "local",
  "bodega",
  "estacionamiento",
]);

export const estadoContratoEnum = pgEnum("estado_contrato", [
  "borrador",
  "firmado",
  "vigente",
  "terminado",
  "en_disputa",
]);

export const tipoContratoEnum = pgEnum("tipo_contrato", [
  "plazo_fijo",
  "mes_a_mes",
  "indefinido",
]);

export const monedaEnum = pgEnum("moneda", ["CLP", "UF"]);

export const tipoReajusteEnum = pgEnum("tipo_reajuste", [
  "ipc_semestral",
  "ipc_anual",
  "uf",
  "sin_reajuste",
]);

export const estadoPagoEnum = pgEnum("estado_pago", [
  "pendiente",
  "pagado",
  "atrasado",
  "en_disputa",
  "condonado",
]);

export const metodoPagoEnum = pgEnum("metodo_pago", [
  "flow",
  "transferencia",
  "efectivo",
  "otro",
]);

export const tipoInventarioEnum = pgEnum("tipo_inventario", [
  "entrega",
  "salida",
  "intermedio",
]);

export const estadoItemEnum = pgEnum("estado_item", [
  "bueno",
  "regular",
  "malo",
]);

export const habitacionEnum = pgEnum("habitacion", [
  "exterior",
  "hall",
  "living",
  "cocina",
  "dormitorio_principal",
  "dormitorio_secundario",
  "bano_principal",
  "bano_secundario",
  "logia",
  "terraza",
  "bodega",
  "medidores",
]);

export const nivelScoreEnum = pgEnum("nivel_score", [
  "excelente",
  "bueno",
  "regular",
  "precaucion",
  "sin_datos",
]);

export const tipoScoreEventoEnum = pgEnum("tipo_score_evento", [
  "pago_puntual",
  "pago_atrasado",
  "referencia",
  "dicom",
  "ingreso_verificado",
  "duracion_arriendo",
  "pago_servicio",
  "contrato_terminado_anticipado",
]);

export const canalNotificacionEnum = pgEnum("canal_notificacion", [
  "email",
  "push",
  "whatsapp",
  "in_app",
]);

export const planSuscripcionEnum = pgEnum("plan_suscripcion", [
  "free",
  "propietario_premium",
  "arrendatario_premium",
]);

export const tipoServicioEnum = pgEnum("tipo_servicio", [
  "luz",
  "agua",
  "gas",
  "internet",
  "gastos_comunes",
]);

export const responsableServicioEnum = pgEnum("responsable_servicio", [
  "arrendador",
  "arrendatario",
]);

// ─── Timestamps helper ────────────────────────────────────────────────────────

const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

// ─── Tablas ───────────────────────────────────────────────────────────────────

/**
 * Perfiles de usuario — extiende auth.users de Supabase
 * RLS: usuarios solo ven/editan su propio perfil
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(), // Mismo UUID que auth.users
    rut: text("rut").unique(),
    nombre: text("nombre"),
    apellido: text("apellido"),
    telefono: text("telefono"),
    rol: rolEnum("rol").notNull().default("arrendatario"),
    verificado: boolean("verificado").notNull().default(false),
    clave_unica_verified: boolean("clave_unica_verified").notNull().default(false),
    avatar_url: text("avatar_url"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("profiles_rut_idx").on(table.rut),
  ]
);

/**
 * Propiedades inmobiliarias
 * RLS: propietario solo ve/edita sus propiedades
 */
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    owner_id: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    direccion: text("direccion").notNull(),
    numero: text("numero"),
    depto: text("depto"),
    comuna: text("comuna").notNull(),
    region: text("region").notNull(),
    tipo: tipoPropiedadEnum("tipo").notNull(),
    metros_cuadrados: decimal("metros_cuadrados", { precision: 8, scale: 2 }),
    dormitorios: integer("dormitorios"),
    banos: integer("banos"),
    amoblada: boolean("amoblada").notNull().default(false),
    valor_uf: decimal("valor_uf", { precision: 8, scale: 2 }).notNull(),
    rol_avaluo: text("rol_avaluo"),
    descripcion: text("descripcion"),
    activa: boolean("activa").notNull().default(true),
    // Flags para servicios básicos aplicables
    tiene_agua: boolean("tiene_agua").notNull().default(true),
    tiene_luz: boolean("tiene_luz").notNull().default(true),
    tiene_gas: boolean("tiene_gas").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("properties_owner_idx").on(table.owner_id),
    index("properties_comuna_idx").on(table.comuna),
  ]
);

/**
 * Contratos de arriendo
 * RLS: arrendador ve sus contratos, arrendatario ve el suyo
 */
export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "restrict" }),
    arrendador_id: uuid("arrendador_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    arrendatario_id: uuid("arrendatario_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    codeudor_id: uuid("codeudor_id").references(() => profiles.id),
    monto: decimal("monto", { precision: 12, scale: 2 }).notNull(),
    moneda: monedaEnum("moneda").notNull().default("CLP"),
    fecha_inicio: date("fecha_inicio").notNull(),
    fecha_fin: date("fecha_fin"), // null = indefinido
    tipo: tipoContratoEnum("tipo").notNull(),
    // Garantía máximo 2 meses por Ley 21.461
    garantia_meses: integer("garantia_meses").notNull().default(1),
    dia_pago: integer("dia_pago").notNull().default(5),
    reajuste: tipoReajusteEnum("reajuste").notNull().default("sin_reajuste"),
    permite_mascotas: boolean("permite_mascotas").notNull().default(false),
    pdf_url: text("pdf_url"),
    firma_arrendador_at: timestamp("firma_arrendador_at", { withTimezone: true }),
    firma_arrendatario_at: timestamp("firma_arrendatario_at", { withTimezone: true }),
    audit_trail: jsonb("audit_trail").notNull().default("[]"),
    estado: estadoContratoEnum("estado").notNull().default("borrador"),
    clausulas_adicionales: text("clausulas_adicionales"),
    ...timestamps,
  },
  (table) => [
    index("contracts_arrendador_idx").on(table.arrendador_id),
    index("contracts_arrendatario_idx").on(table.arrendatario_id),
    index("contracts_property_idx").on(table.property_id),
    index("contracts_estado_idx").on(table.estado),
  ]
);

/**
 * Pagos de arriendo
 * RLS: arrendador ve todos los pagos de sus contratos; arrendatario ve los suyos
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    periodo: date("periodo").notNull(), // Primer día del mes que cubre
    monto_esperado: decimal("monto_esperado", { precision: 12, scale: 2 }).notNull(),
    monto_pagado: decimal("monto_pagado", { precision: 12, scale: 2 }),
    fecha_pago: timestamp("fecha_pago", { withTimezone: true }),
    metodo: metodoPagoEnum("metodo"),
    flow_token: text("flow_token"),
    comprobante_url: text("comprobante_url"),
    estado: estadoPagoEnum("estado").notNull().default("pendiente"),
    dias_atraso: integer("dias_atraso").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("payments_contract_idx").on(table.contract_id),
    index("payments_estado_idx").on(table.estado),
    index("payments_periodo_idx").on(table.periodo),
  ]
);

/**
 * Inventarios de entrega/salida
 * RLS: ambas partes del contrato pueden ver y firmar
 */
export const inventories = pgTable(
  "inventories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    tipo: tipoInventarioEnum("tipo").notNull(),
    fecha: date("fecha").notNull(),
    firmada_arrendador: boolean("firmada_arrendador").notNull().default(false),
    firmada_arrendatario: boolean("firmada_arrendatario").notNull().default(false),
    pdf_url: text("pdf_url"),
    ots_proof_url: text("ots_proof_url"), // Prueba OpenTimestamps blockchain
    ...timestamps,
  },
  (table) => [
    index("inventories_contract_idx").on(table.contract_id),
  ]
);

/**
 * Ítems del inventario por habitación
 */
export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inventory_id: uuid("inventory_id")
      .notNull()
      .references(() => inventories.id, { onDelete: "cascade" }),
    habitacion: habitacionEnum("habitacion").notNull(),
    nombre: text("nombre").notNull(),
    estado: estadoItemEnum("estado").notNull(),
    notas: text("notas"),
    medidor_lectura: text("medidor_lectura"),
    ...timestamps,
  },
  (table) => [
    index("inventory_items_inventory_idx").on(table.inventory_id),
  ]
);

/**
 * Fotos del inventario con metadatos de auditoría
 * SHA-256 + EXIF + geolocalización + certificación blockchain
 */
export const inventoryPhotos = pgTable(
  "inventory_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => inventoryItems.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sha256: text("sha256").notNull(),
    exif: jsonb("exif"),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),
    taken_at: timestamp("taken_at", { withTimezone: true }),
    ots_proof: text("ots_proof"), // Prueba OpenTimestamps en base64
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("inventory_photos_item_idx").on(table.item_id),
  ]
);

/**
 * ArriendoScore por arrendatario (0-1000 puntos)
 * RLS: arrendatario ve su propio score; arrendador ve scores de postulantes con consentimiento
 */
export const arriendoScore = pgTable(
  "arriendo_score",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    arrendatario_id: uuid("arrendatario_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(300),
    nivel: nivelScoreEnum("nivel").notNull().default("sin_datos"),
    breakdown: jsonb("breakdown").notNull().default("{}"),
    calculado_at: timestamp("calculado_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("arriendo_score_arrendatario_idx").on(table.arrendatario_id),
  ]
);

/**
 * Eventos que modifican el ArriendoScore
 */
export const scoreEvents = pgTable(
  "score_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    arrendatario_id: uuid("arrendatario_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tipo: tipoScoreEventoEnum("tipo").notNull(),
    peso: integer("peso").notNull(), // Puede ser negativo
    meta: jsonb("meta"), // Datos adicionales del evento
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("score_events_arrendatario_idx").on(table.arrendatario_id),
    index("score_events_tipo_idx").on(table.tipo),
  ]
);

/**
 * Indicadores económicos diarios (UF, IPC, UTM)
 * Fuente: mindicador.cl — actualización diaria vía cron
 */
export const economicIndicators = pgTable(
  "economic_indicators",
  {
    fecha: date("fecha").primaryKey(),
    uf: decimal("uf", { precision: 10, scale: 2 }).notNull(),
    ipc: decimal("ipc", { precision: 6, scale: 4 }).notNull(),
    utm: decimal("utm", { precision: 10, scale: 2 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

/**
 * Notificaciones multi-canal
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    canal: canalNotificacionEnum("canal").notNull(),
    tipo: text("tipo").notNull(),
    payload: jsonb("payload").notNull().default("{}"),
    enviada_at: timestamp("enviada_at", { withTimezone: true }),
    leida_at: timestamp("leida_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_user_idx").on(table.user_id),
    index("notifications_leida_idx").on(table.leida_at),
  ]
);

/**
 * Documentos legales del Centro Legal
 */
export const legalDocuments = pgTable(
  "legal_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    titulo: text("titulo").notNull(),
    categoria: text("categoria").notNull(),
    contenido_md: text("contenido_md").notNull(),
    actualizado_at: timestamp("actualizado_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...timestamps,
  }
);

/**
 * Pagos de servicios básicos (luz, agua, gas, etc.)
 */
export const servicePayments = pgTable(
  "service_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contract_id: uuid("contract_id")
      .notNull()
      .references(() => contracts.id, { onDelete: "cascade" }),
    servicio: tipoServicioEnum("servicio").notNull(),
    proveedor: text("proveedor"),
    monto: decimal("monto", { precision: 12, scale: 2 }).notNull(),
    periodo: date("periodo").notNull(),
    comprobante_url: text("comprobante_url"),
    responsable: responsableServicioEnum("responsable").notNull(),
    ...timestamps,
  },
  (table) => [
    index("service_payments_contract_idx").on(table.contract_id),
  ]
);

/**
 * Suscripciones de usuarios
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" })
      .unique(),
    plan: planSuscripcionEnum("plan").notNull().default("free"),
    flow_subscription_id: text("flow_subscription_id"),
    vigente_hasta: timestamp("vigente_hasta", { withTimezone: true }),
    ...timestamps,
  }
);

/**
 * Log de auditoría inmutable (Ley 21.719 / GDPR chileno)
 * Sin UPDATE ni DELETE — solo INSERT
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id"), // Nullable para acciones de sistema
    accion: text("accion").notNull(),
    entidad: text("entidad").notNull(),
    entidad_id: text("entidad_id"),
    meta: jsonb("meta"),
    ip: text("ip"),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_user_idx").on(table.user_id),
    index("audit_log_entidad_idx").on(table.entidad, table.entidad_id),
    index("audit_log_created_idx").on(table.created_at),
  ]
);

/**
 * Cuentas de servicios básicos asociadas a una propiedad para tracking automático (Unired, etc.)
 */
export const utilityAccounts = pgTable(
  "utility_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    property_id: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    tipo: tipoServicioEnum("tipo").notNull(),
    proveedor: text("proveedor").notNull(),
    numero_cliente: text("numero_cliente").notNull(),
    monto_deuda: decimal("monto_deuda", { precision: 12, scale: 2 }).notNull().default("0"),
    fecha_vencimiento: date("fecha_vencimiento"),
    ultima_consulta: timestamp("ultima_consulta", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("utility_accounts_property_idx").on(table.property_id),
    uniqueIndex("utility_accounts_unique_idx").on(table.property_id, table.tipo, table.numero_cliente),
  ]
);

/**
 * Consentimientos de usuario (Ley 21.719)
 * Privacy by design
 */
export const userConsents = pgTable(
  "user_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tipo: text("tipo").notNull(), // "score_consulta", "floid_ingresos", "marketing", etc.
    aceptado: boolean("aceptado").notNull(),
    version_documento: text("version_documento").notNull(),
    ip: text("ip"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_consents_user_idx").on(table.user_id),
  ]
);
