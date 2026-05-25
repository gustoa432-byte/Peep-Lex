const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const testId = '123e4567-e89b-12d3-a456-426614174000';
  const { error: insErr } = await supabase.from('profiles').insert({
    id: testId,
    ponts: 10000,
    unlocked_gradients: ['g1'],
    unlocked_prints: ['p1'],
    telegram_id: 12345
  });
  if (insErr) console.error("INSERT ERROR:", insErr);
  else {
     console.log("INSERT SUCCESS");
     await supabase.from('profiles').delete().eq('id', testId);
  }
}
run();
