import { useEffect, useState } from 'react'
import { Trophy, Medal } from 'lucide-react'
import { UserAvatar } from '../components/profile/UserAvatar'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import { calcularEstatisticas } from '../lib/stats'
import { useMatches } from '../hooks/useMatches'

type RankingEntry = Awaited<ReturnType<typeof api.getRanking>>[number]

export function Ranking() {
  const { user } = useAuth()
  const { matches } = useMatches()
  const myStats = calcularEstatisticas(matches)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRanking().then(setRanking).finally(() => setLoading(false))
  }, [matches])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  const myPosition = ranking.findIndex((r) => r.user.id === user?.id) + 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranking"
        subtitle="Vitória = 10 pts · Derrota = 2 pts"
      />

      <Card title="Sua pontuação">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-ctb-light p-4">
            <Trophy className="h-8 w-8 text-ctb-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ctb-primary">{myStats.pontuacao} pts</p>
            <p className="text-sm text-ctb-muted">
              {myPosition > 0
                ? `${myPosition}º lugar no ranking geral`
                : 'Jogue partidas para entrar no ranking'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {myStats.vitorias}V · {myStats.derrotas}D
            </p>
          </div>
        </div>
      </Card>

      <Card title="Ranking geral" subtitle="Entre todos os jogadores">
        {ranking.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Nenhum jogador no ranking ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {ranking.map((entry, i) => (
              <li
                key={entry.user.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  entry.user.id === user?.id
                    ? 'bg-court-50 border border-court-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0
                      ? 'bg-amber-100 text-amber-700'
                      : i === 1
                        ? 'bg-slate-200 text-slate-600'
                        : i === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i < 3 ? <Medal className="h-4 w-4" /> : i + 1}
                </span>
                <UserAvatar user={entry.user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {entry.user.nome}
                    {entry.user.id === user?.id && (
                      <span className="text-court-600 text-xs ml-1">(você)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.user.cidade} · {entry.vitorias}V {entry.derrotas}D
                  </p>
                </div>
                <span className="font-bold text-court-600 shrink-0">
                  {entry.pontuacao} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
