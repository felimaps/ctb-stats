import { Link } from 'react-router-dom'
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Award,
  PlusCircle,
  Crown,
  Layers,
} from 'lucide-react'
import { useMemo } from 'react'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { BadgeList } from '../components/ui/BadgeList'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../context/AuthContext'
import { calcularEstatisticas } from '../lib/stats'
import { calcularBadges } from '../lib/badges'
import { calcularDashboardCategorias } from '../lib/categories'
import { CategoryLabelChip } from '../components/ui/CategoryChip'
import { UserAvatar } from '../components/profile/UserAvatar'
import { getInsightOfDay } from '../lib/coaching'
import { InsightOfDayCard } from '../components/coaching/InsightOfDayCard'

export function Dashboard() {
  const { user } = useAuth()
  const { matches, titles, loading } = useMatches()
  const stats = calcularEstatisticas(matches)
  const badges = calcularBadges(matches, titles)
  const desbloqueadas = badges.filter((b) => b.desbloqueada).length
  const ultimoTitulo = titles[0] ?? null
  const catInfo = calcularDashboardCategorias(matches)
  const insightOfDay = useMemo(
    () => getInsightOfDay({ matches, titles }),
    [matches, titles]
  )

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  const firstName = user?.nome?.split(' ')[0] ?? 'Jogador'

  return (
    <div className="space-y-8">
      {/* Welcome — leve e respirável */}
      <section className="rounded-2xl bg-white border border-ctb-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <UserAvatar user={user} size="lg" className="ring-2 ring-ctb-light" />
            <div className="min-w-0">
              <p className="text-ctb-muted text-sm font-medium">Bem-vindo de volta</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-ctb-dark tracking-tight truncate">
                Olá, {firstName}
              </h1>
            </div>
          </div>
          <Link to="/nova-partida" className="shrink-0">
            <Button className="gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Nova partida
            </Button>
          </Link>
        </div>

        {insightOfDay && matches.length > 0 && (
          <div className="mt-6 pt-6 border-t border-ctb-border">
            <InsightOfDayCard insight={insightOfDay} compact />
          </div>
        )}
      </section>

      {ultimoTitulo && (
        <div className="ctb-card border-amber-100/80 bg-gradient-to-r from-amber-50/40 via-white to-white p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-100 p-3">
              <Crown className="h-6 w-6 text-amber-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-amber-700/80 uppercase tracking-widest">
                Último título
              </p>
              <p className="text-lg font-bold text-ctb-dark mt-0.5 truncate">
                {ultimoTitulo.nome_torneio}
              </p>
              <p className="text-sm text-ctb-muted">
                {ultimoTitulo.placar_final} vs {ultimoTitulo.adversario_final}
              </p>
            </div>
            <Link to="/titulos">
              <Button variant="secondary" size="sm">
                Ver
              </Button>
            </Link>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-xs font-semibold text-ctb-muted uppercase tracking-wider mb-4">
          Resumo
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Vitórias" value={stats.vitorias} icon={Trophy} accent="success" />
          <StatCard label="Derrotas" value={stats.derrotas} icon={Target} accent="danger" />
          <StatCard
            label="Aproveitamento"
            value={`${stats.aproveitamento}%`}
            icon={TrendingUp}
            accent="primary"
          />
          <StatCard label="Títulos" value={titles.length} icon={Crown} accent="gold" />
          <StatCard label="Sequência" value={stats.sequenciaAtual} icon={Flame} accent="gold" />
          <StatCard
            label="Melhor seq."
            value={stats.melhorSequencia}
            icon={Award}
            accent="neutral"
          />
        </div>
      </section>

      {catInfo.categoriaAtual && (
        <Card accent title="Categoria atual" subtitle="Última partida registrada">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-ctb-light p-3">
                <Layers className="h-6 w-6 text-ctb-primary" />
              </div>
              <CategoryLabelChip label={catInfo.categoriaAtual} variant="default" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-ctb-muted sm:ml-auto">
              {catInfo.maisJogada && (
                <span>
                  Mais jogada:{' '}
                  <strong className="text-ctb-dark">{catInfo.maisJogada}</strong>
                </span>
              )}
              {catInfo.melhorAproveitamento && (
                <span>
                  Melhor %:{' '}
                  <strong className="text-ctb-primary">
                    {catInfo.melhorAproveitamento} ({catInfo.melhorTaxa}%)
                  </strong>
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card accent title="Ranking" subtitle="Vitória = 10 pts · Derrota = 2 pts">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-ctb-primary tabular-nums">{stats.pontuacao}</p>
            <p className="text-sm text-ctb-muted mt-0.5">pontos acumulados</p>
          </div>
          <Link to="/ranking">
            <Button variant="secondary" size="sm">
              Ver ranking
            </Button>
          </Link>
        </div>
      </Card>

      <Card title="Conquistas" subtitle={`${desbloqueadas} de ${badges.length} desbloqueadas`}>
        <BadgeList badges={badges} />
      </Card>

      {matches.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-ctb-muted text-sm">
            Você ainda não registrou nenhuma partida.{' '}
            <Link to="/nova-partida" className="text-ctb-primary font-semibold hover:underline">
              Cadastre a primeira!
            </Link>
          </p>
        </Card>
      )}
    </div>
  )
}
