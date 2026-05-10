
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Conectado a la base de datos de Supabase...');
    
    await client.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS tiene_agua BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS tiene_luz BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS tiene_gas BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ ÉXITO: Las columnas tiene_agua, tiene_luz y tiene_gas han sido agregadas.');
  } catch (err) {
    console.error('❌ ERROR en la migración:', err);
  } finally {
    await client.end();
  }
}

migrate();
