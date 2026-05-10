import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase URL or Anon Key is missing. Please check your environment variables.');
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
};

// For backward compatibility while we refactor, but it might still crash if accessed immediately
// Better to export a proxy or just fix the callers.
// Let's refactor the callers to use isSupabaseConfigured and getSupabase() where possible.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : (null as any);
