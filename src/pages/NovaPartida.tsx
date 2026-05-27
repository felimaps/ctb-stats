import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { MatchForm } from '../components/matches/MatchForm'
import { useMatches } from '../hooks/useMatches'
import type { MatchFormData } from '../types'

export function NovaPartida() {
  const navigate = useNavigate()
  const { create } = useMatches()

  const handleSubmit = async (data: MatchFormData) => {
    const { match, error } = await create(data)
    if (error) {
      alert(error)
      return
    }
    if (match) navigate('/historico')
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PageHeader
        title="Nova partida"
        subtitle="Registre os detalhes do seu último jogo"
      />
      <Card>
        <MatchForm onSubmit={handleSubmit} submitLabel="Registrar partida" />
      </Card>
    </div>
  )
}
