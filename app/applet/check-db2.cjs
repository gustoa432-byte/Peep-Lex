const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error("SELECT ERROR:", error);
  else console.log("DATA:", data);

  const testId = '123e4567-e89b-12d3-a456-426614174000';
  const { error: insErr } = await supabase.from('profiles').insert({
    id: testId,
    ponts: 10000,
    unlocked_gradients: ['g1'],
    unlocked_prints: ['p1']
  });
  if (insErr) console.error("INSERT ERROR:", insErr);
  else console.log("INSERT SUCCESS");

  const { error: delErr } = await supabase.from('profiles').delete().eq('id', testId);
  if (delErr) console.error("DELETE ERROR:", delErr);
  else console.log("DELETE SUCCESS");
}
run();
