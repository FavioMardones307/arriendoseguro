/**
 * Script para ejecutar la migración SQL via Supabase Management API
 * Usa fetch nativo de Node.js 18+ para evitar dependencias externas
 * 
 * Ejecutar con: node scripts/run-migration.js
 */

const fs = require("fs");
const path = require("path");

// Credenciales desde variables de entorno (nunca hardcodear secrets)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://leajcnxfkgvvugltaxoi.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] ?? "";

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Falta SUPABASE_SERVICE_ROLE_KEY en variables de entorno");
  process.exit(1);
}

async function runMigration() {
  console.log("📦 Leyendo archivo de migración...");
  
  const sqlPath = path.join(__dirname, "../db/migrations/0000_chief_madripoor.sql");
  let sql = fs.readFileSync(sqlPath, "utf-8");
  
  // Supabase SQL API necesita el SQL sin los comentarios de drizzle-kit
  // Eliminamos los comentarios de statement-breakpoint y los reemplazamos por nada
  // para enviar un SQL limpio
  sql = sql.replace(/-->\s*statement-breakpoint/g, "");
  
  console.log(`📝 SQL cargado: ${sql.length} caracteres`);
  console.log("🚀 Ejecutando migración via Supabase REST API...\n");
  
  // Usamos la endpoint SQL de Supabase (disponible con service_role)
  const url = `${SUPABASE_URL}/rest/v1/rpc/sql`;
  
  // Intentamos con la API de SQL directa
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      }
    });
    console.log("✅ Conexión REST API OK:", response.status);
  } catch (e) {
    console.error("❌ Error conectando a REST API:", e.message);
    return;
  }

  // Dividimos el SQL en statements individuales
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 5);
  
  console.log(`📋 Total de statements a ejecutar: ${statements.length}\n`);

  let exitosos = 0;
  let errores = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;
    
    const preview = stmt.substring(0, 60).replace(/\n/g, " ");
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ query: stmt + ";" }),
      });
      
      if (res.ok || res.status === 404) {
        // 404 means the rpc doesn't exist, try alternative
        if (res.status === 404) {
          // Use the pg_exec approach via PostgREST
          await executeSQLViaPostgREST(SUPABASE_URL, SERVICE_ROLE_KEY, stmt);
          exitosos++;
          console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
        } else {
          exitosos++;
          console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
        }
      } else {
        const body = await res.text();
        // Ignorar errores de "ya existe" (idempotente)
        if (body.includes("already exists")) {
          exitosos++;
          console.log(`  ⚠️  [${i + 1}/${statements.length}] Ya existe: ${preview}...`);
        } else {
          errores++;
          console.error(`  ❌ [${i + 1}/${statements.length}] Error: ${body.substring(0, 100)}`);
        }
      }
    } catch (e) {
      errores++;
      console.error(`  ❌ [${i + 1}/${statements.length}] Error: ${e.message}`);
    }
  }
  
  console.log(`\n📊 Resultado: ${exitosos} exitosos, ${errores} errores`);
}

async function executeSQLViaPostgREST(url, key, sql) {
  // PostgREST no permite SQL directo, necesitamos la Management API
  throw new Error("exec_sql RPC no disponible");
}

runMigration().catch(console.error);
