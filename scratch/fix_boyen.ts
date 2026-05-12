
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  try {
    const { data: props, error: fetchError } = await supabase
      .from('properties')
      .select('id, direccion')
      .or('direccion.ilike.%Boyén%,comuna.eq.Rancagua')
    
    if (fetchError) throw fetchError;

    if (props && props.length > 0) {
      for (const prop of props) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ 
            moneda: 'CLP', 
            valor_arriendo: 450000 
          })
          .eq('id', prop.id)
        
        if (updateError) throw updateError;
        console.log(`✅ Propiedad corregida: ${prop.direccion}`);
      }
    } else {
      console.log('❌ No se encontró la propiedad.');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
fix();
