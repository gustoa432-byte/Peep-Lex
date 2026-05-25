const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error(error);
  else console.log(data);
}
run();
