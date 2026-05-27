import { Swords } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { RivalCard } from '../components/rivalries/RivalCard'
import { useMatches } from '../hooks/useMatches'
import { calcularRivalidadesDetalhadas } from '../lib/rivalries'

export function Rivalidades() {
  const { matches, titles, loading } = useMatches()
  const rivalidades = calcularRivalidadesDetalhadas(matches, titles)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Rivalidades"
        subtitle="Veja seu histórico contra cada adversário."
      />

      {rivalidades.length === 0 ? (
        <Card className="text-center py-12">
          <Swords className="h-12 w-12 text-ctb-muted/30 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-ctb-dark font-medium">Você ainda não tem rivalidades cadastradas.</p>
          <p className="text-ctb-muted text-sm mt-2 max-w-sm mx-auto">
            Adicione partidas para começar a criar seu histórico contra adversários.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rivalidades.map((r) => (
            <RivalCard key={r.slug} rival={r} allRivals={rivalidades} />
          ))}
        </div>
      )}
    </div>
  )
}
