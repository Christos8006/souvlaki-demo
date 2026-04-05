import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0

let client = null

export function getSupabaseClient() {
  if (!hasSupabase) return null
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  return client
}
