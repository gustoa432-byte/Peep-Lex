const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error(error);
    return;
  }
  for (const profile of data) {
    await supabase.from('profiles').update({
      ponts: (profile.ponts || 0) + 10000,
      prs: (profile.prs || 0) + 10000
    }).eq('id', profile.id);
  }
  console.log('Done mapping profiles.');
}
run();
