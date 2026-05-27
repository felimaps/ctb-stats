import type { ReactNode } from 'react'
import { isSupabaseConfigured } from '../../lib/supabase'

export function SupabaseConfigGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>

  return (
    <div className="min-h-dvh flex items-center justify-center bg-ctb-bg px-4">
      <div className="max-w-md rounded-2xl border border-ctb-border bg-white p-6 shadow-md text-center space-y-3">
        <p className="text-2xl">🎾</p>
        <h1 className="text-xl font-bold text-ctb-dark">CTB Stats</h1>
        <p className="text-sm text-ctb-muted">
          Configure o Supabase para usar o app com dados reais na nuvem.
        </p>
        <ol className="text-left text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>
            Copie <code className="text-xs bg-slate-100 px-1 rounded">.env.example</code> para{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">.env</code> na{' '}
            <strong>raiz do projeto</strong> (não em <code className="text-xs">src/</code>)
          </li>
          <li>Preencha URL e chave anon do painel Supabase</li>
          <li>Execute <code className="text-xs bg-slate-100 px-1 rounded">supabase/setup_completo.sql</code></li>
          <li>Reinicie com <code className="text-xs bg-slate-100 px-1 rounded">npm run dev</code></li>
        </ol>
      </div>
    </div>
  )
}
