require('dotenv').config({ path: '/Users/glynne/Desktop/SERVEX_AI/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: d1 } = await supabase.from('ClientsSERVEX_WBD').select('id').limit(1);
  const { data: d2 } = await supabase.from('ClientsSERVEX').select('id, company_name').eq('company_name', 'WBD').limit(1);
  console.log("ClientsSERVEX_WBD:", d1);
  console.log("ClientsSERVEX for WBD:", d2);
}
test();
