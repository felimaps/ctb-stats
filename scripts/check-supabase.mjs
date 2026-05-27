#!/usr/bin/env node
/**
 * Verifica se o .env tem credenciais Supabase válidas.
 * Uso: node scripts/check-supabase.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')

if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado. Copie .env.example para .env')
  process.exit(1)
}

const env = readFileSync(envPath, 'utf8')
const url = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1]?.trim() ?? ''
const key = env.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1]?.trim() ?? ''

const placeholders = ['seu-projeto', 'sua-chave-anon']
const ok =
  url &&
  key &&
  !placeholders.some((p) => url.toLowerCase().includes(p) || key.toLowerCase().includes(p))

if (ok) {
  console.log('✅ Supabase configurado:', url)
  process.exit(0)
}

console.error('❌ Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env')
process.exit(1)
