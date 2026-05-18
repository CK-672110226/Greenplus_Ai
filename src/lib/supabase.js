import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[greenplus] Missing Supabase env vars — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

// Fallback to placeholder so the client initialises and the app mounts.
// All DB calls will fail gracefully at runtime when env vars are absent.
export const supabase = createClient(
  supabaseUrl     ?? 'http://localhost',
  supabaseAnonKey ?? 'placeholder'
)
