import type { MatchFormData } from '../types'
import { titleFromForm } from './titles'

export function canRegisterTitle(form: MatchFormData): boolean {
  return Boolean(
    form.conquistou_titulo &&
      form.vale_titulo &&
      form.nome_torneio?.trim() &&
      form.categoria_torneio?.trim() &&
      form.nivel_torneio &&
      form.fase_partida === 'final' &&
      form.resultado === 'vitoria'
  )
}

export function buildTitlePayload(userId: string, form: MatchFormData, matchId: string) {
  return titleFromForm(
    userId,
    {
      nome_torneio: form.nome_torneio!.trim(),
      categoria_torneio: form.categoria_torneio!.trim(),
      nivel_torneio: form.nivel_torneio!,
      adversario: form.adversario,
      placar: form.placar,
      tipo_quadra: form.tipo_quadra,
      data: form.data,
    },
    matchId
  )
}
