import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

const PLACEHOLDER_MARKERS = ['seu-projeto', 'sua-chave-anon', 'your-project', 'your-anon-key', 'xxxxxxxx']

function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase()
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m))
}

export const isSupabaseConfigured = Boolean(
  url && key && !looksLikePlaceholder(url) && !looksLikePlaceholder(key)
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'ctb-stats-auth',
      },
    })
  : null

/** Cliente Supabase (lança se .env não estiver na raiz do projeto) */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Crie o arquivo .env na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    )
  }
  return supabase
}
