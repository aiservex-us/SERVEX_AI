const { createClient } = require('./node_modules/@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
env.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].replace('\r', '');
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].replace('\r', '');
});

const supabase = createClient(url, key);

async function test() {
    const { data, error } = await supabase.from('AI_Users').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
