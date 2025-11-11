import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_URL_DATABASE;
const supabaseKey = import.meta.env.VITE_API_KEY_DATABASE;

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;