import * as fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error(error);
  else {
    fs.writeFileSync('./schema.json', JSON.stringify(data, null, 2));
    console.log(Object.keys(data[0] || {}));
  }
}
run();
