import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { MatchForm } from '../components/matches/MatchForm'
import { useMatches } from '../hooks/useMatches'
import { QUADRA_LABELS, RESULTADO_LABELS } from '../types'
import type { Match, MatchFormData } from '../types'
import { CategoryChip } from '../components/ui/CategoryChip'
import { calcularDashboardCategorias } from '../lib/categories'

export function Historico() {
  const { matches, loading, update, remove } = useMatches()
  const catInfo = calcularDashboardCategorias(matches)
  const [editing, setEditing] = useState<Match | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleUpdate = async (data: MatchFormData) => {
    if (!editing) return
    await update(editing.id, data)
    setEditing(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta partida?')) return
    setDeleting(id)
    await remove(id)
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (editing) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-slate-800">Editar partida</h1>
        <Card>
          <MatchForm
            initial={editing}
            onSubmit={handleUpdate}
            submitLabel="Atualizar partida"
          />
        </Card>
        <Button variant="ghost" onClick={() => setEditing(null)}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico</h1>
          <p className="text-sm text-slate-500">{matches.length} partidas</p>
        </div>
        <Link to="/nova-partida">
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Nova
          </Button>
        </Link>
      </div>

      {matches.length === 0 ? (
        <Card>
          <p className="text-center text-slate-500 py-6 text-sm">
            Nenhuma partida registrada ainda.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 md:hidden">
          {matches.map((m) => (
            <Card key={m.id} className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        m.resultado === 'vitoria'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {RESULTADO_LABELS[m.resultado]}
                    </span>
                    <span className="text-xs text-slate-400">
                      {QUADRA_LABELS[m.tipo_quadra]}
                    </span>
                    <CategoryChip
                      match={m}
                      categoriaAtualKey={catInfo.categoriaAtualKey}
                    />
                  </div>
                  <p className="font-semibold text-slate-800 mt-1">vs {m.adversario}</p>
                  <p className="text-sm text-slate-600">{m.placar}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(parseISO(m.data), "dd MMM yyyy", { locale: ptBR })}
                    {m.duracao ? ` · ${m.duracao} min` : ''}
                  </p>
                  {m.observacoes && (
                    <p className="text-xs text-slate-500 mt-1 italic">{m.observacoes}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(m)}
                    className="p-2 rounded-lg text-slate-400 hover:text-court-600 hover:bg-court-50"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tabela desktop */}
      {matches.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Adversário</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Placar</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Resultado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Quadra</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Duração</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-600">
                    {format(parseISO(m.data), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-4 py-3 font-medium">{m.adversario}</td>
                  <td className="px-4 py-3">{m.placar}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        m.resultado === 'vitoria' ? 'text-emerald-600' : 'text-red-500'
                      }
                    >
                      {RESULTADO_LABELS[m.resultado]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{QUADRA_LABELS[m.tipo_quadra]}</td>
                  <td className="px-4 py-3">
                    <CategoryChip
                      match={m}
                      categoriaAtualKey={catInfo.categoriaAtualKey}
                    />
                    {!m.categoria_jogo && '—'}
                  </td>
                  <td className="px-4 py-3">{m.duracao ? `${m.duracao} min` : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditing(m)}
                        className="p-1.5 text-slate-400 hover:text-court-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
