import { createClient } from '@supabase/supabase-js';

// Pega as chaves que configuramos no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cria a conexão
export const supabase = createClient(supabaseUrl, supabaseKey);
