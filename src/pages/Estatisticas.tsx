import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { PageHeader } from '../components/ui/PageHeader'
import { StatsCharts } from '../components/charts/StatsCharts'
import { CorpoMenteSection } from '../components/wellness/CorpoMenteSection'
import { TitlesStatsSection } from '../components/titles/TitlesStatsSection'
import { CategoryEvolutionSection } from '../components/categories/CategoryEvolutionSection'
import { useMatches } from '../hooks/useMatches'
import {
  vitoriasPorSemana,
  vitoriasPorMes,
  vitoriasPorAno,
  aproveitamentoAoLongoDoTempo,
} from '../lib/charts'

export function Estatisticas() {
  const { matches, titles, loading } = useMatches()

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  const porMes = vitoriasPorMes(matches)

  return (
    <div className="space-y-10">
      <PageHeader
        title="Estatísticas"
        subtitle="Visualize sua evolução ao longo do tempo"
      />

      <StatsCharts
        porSemana={vitoriasPorSemana(matches)}
        porMes={porMes}
        porAno={vitoriasPorAno(matches)}
        partidasPorMes={porMes}
        aproveitamento={aproveitamentoAoLongoDoTempo(matches)}
      />

      <div className="border-t border-ctb-border pt-8">
        <CategoryEvolutionSection matches={matches} titles={titles} />
      </div>

      <div className="border-t border-ctb-border pt-8">
        <TitlesStatsSection titles={titles} matches={matches} />
      </div>

      <div className="border-t border-ctb-border pt-8">
        <CorpoMenteSection matches={matches} />
      </div>
    </div>
  )
}
