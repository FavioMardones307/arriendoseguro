# ArriendoSeguro 🏠

> Plataforma SaaS chilena que digitaliza la relación entre arrendadores y arrendatarios.  
> Legal, seguro y 100% digital.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript estricto |
| Estilos | Tailwind CSS v4 + Sistema de diseño propio |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Drizzle ORM |
| IA | Claude Sonnet (contratos) + Claude Haiku (chatbot) |
| Pagos | Flow.cl |
| Emails | Resend |
| Testing | Vitest (27/27 tests) |
| Deploy | Vercel |

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local  # completar credenciales
npm run dev
```

App disponible en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (Turbopack)
npm run build        # Build de producción
npm run lint         # Revisar código con ESLint
npm run type-check   # Verificar tipos TypeScript
npm run test         # Suite de tests (27 tests)
npm run db:generate  # Generar migraciones Drizzle
npm run db:push      # Aplicar schema a Supabase
npm run db:studio    # Abrir Drizzle Studio
npm run db:seed      # Poblar BD con datos de prueba
```

## Variables de entorno requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave admin Supabase | ✅ |
| `DATABASE_URL` | Conexión directa PostgreSQL | ✅ |
| `ANTHROPIC_API_KEY` | API key Claude (contratos/chatbot) | Para IA |
| `FLOW_API_KEY` | API key Flow.cl | Para pagos |
| `FLOW_SECRET_KEY` | Secret Flow.cl | Para webhooks |
| `RESEND_API_KEY` | API key Resend | Para emails |
| `CRON_SECRET` | Secret endpoints cron | Para Vercel Cron |

## Estructura del proyecto

```
arriendoseguro/
├── app/
│   ├── page.tsx               # Landing page pública
│   ├── login/ registro/       # Autenticación
│   ├── propietario/           # Dashboard propietario
│   │   ├── page.tsx           # Resumen + semáforo de pagos
│   │   ├── propiedades/       # Gestión de propiedades
│   │   └── contratos/nuevo/   # Wizard contratos (7 pasos)
│   ├── arrendatario/          # Dashboard arrendatario
│   │   ├── page.tsx           # Mi arriendo + próximo pago
│   │   └── score/             # ArriendoScore con breakdown
│   └── api/
│       ├── webhooks/flow/     # Webhook pagos Flow.cl
│       └── cron/indicators/   # Actualización UF/IPC/UTM diaria
├── components/
│   ├── auth/                  # LoginForm, RegistroForm
│   ├── contracts/             # ContratoWizard (7 pasos)
│   ├── score/                 # ScoreGauge (SVG animado)
│   └── shared/                # Navbar, Footer, Sidebar, Header
├── lib/
│   ├── chile/                 # rut.ts, format.ts (CLP/UF/fechas)
│   ├── supabase/              # client, server, middleware
│   ├── score/                 # Algoritmo ArriendoScore (7 categorías)
│   └── ai/                    # Wrapper Claude API con retry + stub
├── db/
│   └── schema.ts              # Schema Drizzle ORM (15 tablas)
└── tests/
    ├── rut.test.ts             # 14 tests RUT (14/14 ✅)
    └── score.test.ts           # 13 tests Score (13/13 ✅)
```

## Roadmap de 12 meses

| Hito | Descripción | Estado |
|------|-------------|--------|
| 0 | Bootstrap y configuración | ✅ Completado |
| 1 | Schema de base de datos (15 tablas) | ✅ Completado |
| 2 | Utilidades Chile (RUT, CLP, UF) | ✅ Completado |
| 3 | Landing page pública | ✅ Completado |
| 4 | Auth (login, registro, Google OAuth) | ✅ Completado |
| 5 | Dashboard dual propietario/arrendatario | ✅ Completado |
| 6 | Wizard de contratos IA (7 pasos) | ✅ Completado |
| 7 | Integración Flow.cl (webhook listo) | 🔄 En progreso |
| 8 | Inventario fotográfico | ⏳ Pendiente |
| 9 | Sistema de alertas multicanal | ⏳ Pendiente |
| 10 | ArriendoScore (algoritmo + gauge UI) | ✅ Completado |
| 11 | Centro legal IA (chatbot) | ⏳ Pendiente |
| 12 | Reporte tributario SII | ⏳ Pendiente |

## Leyes implementadas

- **Ley 18.101** — Arrendamiento de Predios Urbanos (base del wizard)
- **Ley 21.461** — Garantía máxima 2 meses (validada en wizard)
- **Ley 19.799** — Firma electrónica (PDF descargable)
- **Ley 21.719** — Protección de datos personales (score con consentimiento)

## Despliegue en Vercel

```bash
vercel --prod
```

El cron de indicadores económicos se ejecuta automáticamente cada día a las **09:00 AM** (UTC) vía `vercel.json`.

---

Hecho con ❤️ en Santiago, Chile 🇨🇱
