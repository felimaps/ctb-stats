import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Trophy } from 'lucide-react'
import type { Title } from '../../types'

export function TitleTimeline({ titles }: { titles: Title[] }) {
  const ordenados = [...titles].sort(
    (a, b) => new Date(a.data_titulo).getTime() - new Date(b.data_titulo).getTime()
  )

  if (ordenados.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-6">
        Sua linha do tempo de títulos aparecerá aqui.
      </p>
    )
  }

  const primeiro = ordenados[0]
  const recentes = [...ordenados].reverse().slice(0, 5)

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-100" />
      <ul className="space-y-6">
        {recentes.map((t, i) => (
          <li key={t.id} className="relative pl-10">
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white shadow ${
                i === 0 ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-amber-300'
              }`}
            />
            <div className="rounded-xl bg-white/80 border border-amber-100/80 p-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="font-semibold text-slate-800 text-sm">{t.nome_torneio}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {format(parseISO(t.data_titulo), "MMMM yyyy", { locale: ptBR })} ·{' '}
                {t.categoria}
              </p>
              {i === recentes.length - 1 && ordenados.length > 1 && (
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  🌱 Primeiro título: {primeiro.nome_torneio} (
                  {format(parseISO(primeiro.data_titulo), 'yyyy')})
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
