import type { GeneralTip } from './types'

/** Biblioteca estática — complementa insights personalizados */
export const GENERAL_TIPS: GeneralTip[] = [
  {
    id: 'aquecimento',
    titulo: 'Aquecimento de 10 min',
    descricao: 'Mobilize ombros, punhos e tornozelos antes de entrar em quadra.',
    categoria: 'fisico',
    icone: '🔥',
  },
  {
    id: 'hidratacao',
    titulo: 'Hidratação constante',
    descricao: 'Beba água a cada mudança de lado, não só quando sentir sede.',
    categoria: 'fisico',
    icone: '💧',
  },
  {
    id: 'mentalidade',
    titulo: 'Um ponto de cada vez',
    descricao: 'Foque só no próximo ponto, não no placar inteiro.',
    categoria: 'mental',
    icone: '🧠',
  },
  {
    id: 'recuperacao',
    titulo: 'Sono e recuperação',
    descricao: 'Descanso de qualidade impacta reflexos e decisões no terceiro set.',
    categoria: 'recuperacao',
    icone: '😴',
  },
  {
    id: 'tie-break',
    titulo: 'Tie-break com calma',
    descricao: 'Respire antes do saque e jogue um ponto extra seguro primeiro.',
    categoria: 'tatico',
    icone: '⚡',
  },
  {
    id: 'saque',
    titulo: 'Ritmo no saque',
    descricao: 'Consistência no primeiro saque vale mais que velocidade máxima.',
    categoria: 'tatico',
    icone: '🎯',
  },
  {
    id: 'movimentacao',
    titulo: 'Pés ativos',
    descricao: 'Pequenos passos de ajuste entre bolas mantêm você no ponto certo.',
    categoria: 'fisico',
    icone: '👟',
  },
  {
    id: 'respiracao',
    titulo: 'Respiração entre pontos',
    descricao: 'Expire na execução do golpe para manter o corpo solto.',
    categoria: 'mental',
    icone: '🌬️',
  },
  {
    id: 'consistencia',
    titulo: 'Menos erros, mais jogos',
    descricao: 'Reduzir falhas não forçadas costuma render mais vitórias que winners.',
    categoria: 'consistencia',
    icone: '📈',
  },
]
