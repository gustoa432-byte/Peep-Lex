const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error("SELECT ERROR:", error);
  else console.log("DATA:", data);

  const { error: insErr } = await supabase.from('profiles').insert({ id: 'test_123', ponts: 10000 });
  if (insErr) console.error("INSERT ERROR:", insErr);
  else console.log("INSERT SUCCESS");

  const { error: delErr } = await supabase.from('profiles').delete().eq('id', 'test_123');
  if (delErr) console.error("DELETE ERROR:", delErr);
  else console.log("DELETE SUCCESS");
}
run();
