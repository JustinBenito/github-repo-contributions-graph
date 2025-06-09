import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Anon Key from your Supabase project settings
// It is highly recommended to use environment variables for these in a production environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 