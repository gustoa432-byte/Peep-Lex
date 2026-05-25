import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://xbjomfkukuljfdvqxndh.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Pe_IqLChjFxZUeASkPLFmA_3G4b8Sls';

export const supabase = createClient(supabaseUrl, supabaseKey);
