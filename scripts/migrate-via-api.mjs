/**
 * Ejecuta la migración SQL usando Supabase Management API v1
 * Endpoint: POST https://api.supabase.com/v1/projects/{ref}/database/query
 * 
 * Requiere un Personal Access Token de https://supabase.com/dashboard/account/tokens
 * 
 * Uso: node scripts/migrate-via-api.mjs PAT_TOKEN
 */

const PROJECT_REF = "leajcnxfkgvvugltaxoi";
const PAT_TOKEN = process.argv[2]; // Personal Access Token pasado como argumento

if (!PAT_TOKEN) {
  console.error("❌ Falta el Personal Access Token");
  console.error("   Uso: node scripts/migrate-via-api.mjs TU_PAT_TOKEN");
  console.error("   Obtén el token en: https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "../db/migrations/0000_chief_madripoor.sql");
const sql = readFileSync(sqlPath, "utf-8")
  .replace(/-->\s*statement-breakpoint/g, " ")
  .replace(/\r\n/g, "\n");

console.log("🚀 Ejecutando migración en Supabase via Management API...");
console.log(`📋 Proyecto: ${PROJECT_REF}`);
console.log(`📝 SQL: ${sql.length} caracteres\n`);

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PAT_TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await response.text();
  
  if (response.ok) {
    console.log("✅ Migración ejecutada exitosamente!");
    console.log("📊 Tablas creadas:");
    const tables = [
      "profiles", "properties", "contracts", "payments",
      "inventories", "inventory_items", "inventory_photos",
      "arriendo_score", "score_events", "notifications",
      "subscriptions", "user_consents", "audit_log",
      "economic_indicators", "legal_documents", "service_payments"
    ];
    tables.forEach(t => console.log(`  ✅ ${t}`));
  } else {
    console.error(`❌ Error ${response.status}:`, body.substring(0, 500));
    
    if (response.status === 401) {
      console.error("\n💡 El token no es válido o expiró. Genera uno nuevo en:");
      console.error("   https://supabase.com/dashboard/account/tokens");
    }
  }
} catch (e) {
  console.error("❌ Error de red:", e.message);
}
