export type Nivel = 'iniciante' | 'intermediario' | 'avancado'
export type MaoDominante = 'direita' | 'esquerda'
export type Resultado = 'vitoria' | 'derrota'
export type TipoQuadra = 'saibro' | 'rapida' | 'grama' | 'indoor'

export type CategoriaJogo =
  | 'iniciante'
  | 'intermediario'
  | 'avancado'
  | 'classe_4'
  | 'classe_3'
  | 'classe_2'
  | 'classe_1'
  | 'livre'
  | 'senior'
  | 'dupla'
  | 'outra'

export type NivelTorneio =
  | 'amistoso'
  | 'local'
  | 'clube'
  | 'regional'
  | 'estadual'
  | 'nacional'

export type FasePartida =
  | 'fase_grupos'
  | 'oitavas'
  | 'quartas'
  | 'semifinal'
  | 'final'

export type HumorOpcao =
  | 'calmo'
  | 'animado'
  | 'ansioso'
  | 'confiante'
  | 'dispersivo'
  | 'estressado'
  | 'feliz'
  | 'frustrado'
  | 'irritado'
  | 'tranquilo'
  | 'triste'

export type CorpoOpcao =
  | 'cansado'
  | 'dor_muscular'
  | 'caimbra'
  | 'fraco'
  | 'nausea'
  | 'sem_sintomas'

export type TipoSanguineo =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'

export interface UserProfile {
  id: string
  nome: string
  email: string
  foto_url: string | null
  cidade: string
  nivel: Nivel
  mao_dominante: MaoDominante
  estilo_jogo: string
  tipo_sanguineo: TipoSanguineo | null
  alergias: string | null
  lesoes_recorrentes: string | null
  observacoes_medicas: string | null
  contato_emergencia: string | null
  telefone_emergencia: string | null
  medicacao_continua: string | null
  restricoes_fisicas: string | null
  saude_privada: boolean
  saude_compartilhar_admins: boolean
  ocultar_telefone_emergencia: boolean
  created_at: string
}

/** Dados visíveis publicamente — sem informações médicas */
export interface PublicUserProfile {
  id: string
  nome: string
  email: string
  foto_url: string | null
  cidade: string
  nivel: Nivel
  mao_dominante: MaoDominante
  estilo_jogo: string
  created_at: string
}

export const TIPO_SANGUINEO_OPTIONS: { value: TipoSanguineo; label: string }[] = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

export interface Match {
  id: string
  user_id: string
  adversario: string
  data: string
  placar: string
  resultado: Resultado
  tipo_quadra: TipoQuadra
  duracao: number | null
  observacoes: string | null
  humor_antes: HumorOpcao[]
  corpo_antes: CorpoOpcao[]
  humor_depois: HumorOpcao[]
  corpo_depois: CorpoOpcao[]
  vale_titulo: boolean
  nome_torneio: string | null
  categoria_torneio: string | null
  nivel_torneio: NivelTorneio | null
  fase_partida: FasePartida | null
  conquistou_titulo: boolean
  categoria_jogo: CategoriaJogo | null
  categoria_personalizada: string | null
  created_at: string
}

export interface Title {
  id: string
  user_id: string
  nome_torneio: string
  categoria: string
  nivel_torneio: NivelTorneio
  adversario_final: string
  placar_final: string
  tipo_quadra: TipoQuadra
  data_titulo: string
  match_id: string | null
  created_at: string
}

export interface Like {
  id: string
  match_id: string
  user_id: string
}

export interface MatchFormData {
  adversario: string
  data: string
  placar: string
  resultado: Resultado
  tipo_quadra: TipoQuadra
  duracao?: number | null
  observacoes?: string | null
  humor_antes?: HumorOpcao[]
  corpo_antes?: CorpoOpcao[]
  humor_depois?: HumorOpcao[]
  corpo_depois?: CorpoOpcao[]
  vale_titulo?: boolean
  nome_torneio?: string | null
  categoria_torneio?: string | null
  nivel_torneio?: NivelTorneio | null
  fase_partida?: FasePartida | null
  conquistou_titulo?: boolean
  categoria_jogo?: CategoriaJogo | null
  categoria_personalizada?: string | null
}

export interface MatchStats {
  totalPartidas: number
  vitorias: number
  derrotas: number
  aproveitamento: number
  sequenciaAtual: number
  melhorSequencia: number
  pontuacao: number
}

export interface RivalEvolucaoPonto {
  data: string
  label: string
  resultado: Resultado
  placar: string
  vitoriasAcum: number
  derrotasAcum: number
}

export interface RivalStats {
  adversario: string
  slug: string
  jogos: number
  vitorias: number
  derrotas: number
  aproveitamento: number
  ultimoPlacar: string
  ultimaData: string
  sequenciaAtual: number
  sequenciaLabel: string
  melhorVitoria: string | null
  piorDerrota: string | null
  melhorQuadra: TipoQuadra | null
  melhorQuadraTaxa: number
  /** Tipo de quadra com maior frequência nos confrontos (independente de aproveitamento) */
  quadraMaisFrequente: TipoQuadra | null
  /** Categoria do jogo com maior frequência nos confrontos */
  categoriaMaisFrequente: string | null
  evolucao: RivalEvolucaoPonto[]
  humorAntesComum: string | null
  humorDepoisComum: string | null
  corpoAntesComum: string | null
  corpoDepoisComum: string | null
  finaisDisputadas: number
  finaisVencidas: number
  finaisPerdidas: number
  aproveitamentoFinais: number
  titulosContra: number
  categoriasContra: {
    label: string
    jogos: number
    vitorias: number
    derrotas: number
    aproveitamento: number
  }[]
  partidas: Match[]
}

export interface Badge {
  id: string
  titulo: string
  descricao: string
  icone: string
  desbloqueada: boolean
}

export interface FeedItem extends Match {
  jogador_nome: string
  jogador_foto: string | null
  likes_count: number
  user_liked: boolean
  destaque_titulo: boolean
}

export const NIVEL_TORNEIO_LABELS: Record<NivelTorneio, string> = {
  amistoso: 'Amistoso',
  local: 'Local',
  clube: 'Clube',
  regional: 'Regional',
  estadual: 'Estadual',
  nacional: 'Nacional',
}

export const FASE_PARTIDA_LABELS: Record<FasePartida, string> = {
  fase_grupos: 'Fase de grupos',
  oitavas: 'Oitavas',
  quartas: 'Quartas',
  semifinal: 'Semifinal',
  final: 'Final',
}

export const FASES_FINAIS: FasePartida[] = ['semifinal', 'final']

export const CATEGORIA_JOGO_OPTIONS: { value: CategoriaJogo; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'classe_4', label: '4ª classe' },
  { value: 'classe_3', label: '3ª classe' },
  { value: 'classe_2', label: '2ª classe' },
  { value: 'classe_1', label: '1ª classe' },
  { value: 'livre', label: 'Livre' },
  { value: 'senior', label: 'Sênior' },
  { value: 'dupla', label: 'Dupla' },
  { value: 'outra', label: 'Outra' },
]

export const CATEGORIA_JOGO_LABELS: Record<CategoriaJogo, string> =
  Object.fromEntries(CATEGORIA_JOGO_OPTIONS.map((o) => [o.value, o.label])) as Record<
    CategoriaJogo,
    string
  >

export function getCategoriaDisplay(m: {
  categoria_jogo: CategoriaJogo | null
  categoria_personalizada?: string | null
}): string {
  if (!m.categoria_jogo) return '—'
  if (m.categoria_jogo === 'outra' && m.categoria_personalizada?.trim()) {
    return m.categoria_personalizada.trim()
  }
  return CATEGORIA_JOGO_LABELS[m.categoria_jogo] ?? m.categoria_jogo
}

export const HUMOR_OPCOES: { value: HumorOpcao; label: string }[] = [
  { value: 'calmo', label: 'Calmo' },
  { value: 'animado', label: 'Animado' },
  { value: 'ansioso', label: 'Ansioso' },
  { value: 'confiante', label: 'Confiante' },
  { value: 'dispersivo', label: 'Dispersivo' },
  { value: 'estressado', label: 'Estressado' },
  { value: 'feliz', label: 'Feliz' },
  { value: 'frustrado', label: 'Frustrado' },
  { value: 'irritado', label: 'Irritado' },
  { value: 'tranquilo', label: 'Tranquilo' },
  { value: 'triste', label: 'Triste' },
]

export const CORPO_OPCOES: { value: CorpoOpcao; label: string }[] = [
  { value: 'cansado', label: 'Cansado' },
  { value: 'dor_muscular', label: 'Dor muscular' },
  { value: 'caimbra', label: 'Câimbra' },
  { value: 'fraco', label: 'Fraco' },
  { value: 'nausea', label: 'Náusea' },
  { value: 'sem_sintomas', label: 'Sem sintomas' },
]

export const NIVEL_LABELS: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

export const QUADRA_LABELS: Record<TipoQuadra, string> = {
  saibro: 'Saibro',
  rapida: 'Rápida',
  grama: 'Grama',
  indoor: 'Indoor',
}

export const RESULTADO_LABELS: Record<Resultado, string> = {
  vitoria: 'Vitória',
  derrota: 'Derrota',
}

export function labelHumor(v: string): string {
  return HUMOR_OPCOES.find((o) => o.value === v)?.label ?? v
}

export function labelCorpo(v: string): string {
  return CORPO_OPCOES.find((o) => o.value === v)?.label ?? v
}
