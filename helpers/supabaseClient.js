// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ⛓️ URL dan anon key dari env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🎯 Buat Supabase client instance
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;