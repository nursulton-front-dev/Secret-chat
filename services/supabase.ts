import { createClient } from '@supabase/supabase-js';

// NOTE: in a real environment, these are process.env.VITE_SUPABASE_URL
// For the generated code to run without errors in a blank environment, we handle undefined.

const getEnv = (key: string) => {
  try {
    // Safely check if env exists on import.meta
    // @ts-ignore
    const env = (import.meta as any).env;
    if (env) {
      return env[key] || '';
    }
  } catch (e) {
    console.warn('Environment variable access failed', e);
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// We create the client conditionally. If no keys are provided, we will mock responses.
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Mock function for demo purposes if Supabase is not connected
export const mockFetchLogs = async () => {
    return { data: [], error: null };
}

export const mockInsertLog = async (log: any) => {
    return { data: log, error: null };
}