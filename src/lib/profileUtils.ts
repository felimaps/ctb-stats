import type { UserProfile, PublicUserProfile } from '../types'

const MAX_TEXT = 2000
const MAX_SHORT = 120

/** Remove tags e limita tamanho de campos de texto */
export function sanitizeText(value: string, max = MAX_TEXT): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max)
}

export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\s()-]/g, '').trim().slice(0, MAX_SHORT)
}

export function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const fotoUrl =
    (raw.foto_url as string) ?? (raw.foto as string) ?? null

  return {
    ...(raw as unknown as UserProfile),
    foto_url: fotoUrl || null,
    tipo_sanguineo: (raw.tipo_sanguineo as UserProfile['tipo_sanguineo']) ?? null,
    alergias: (raw.alergias as string) ?? null,
    lesoes_recorrentes: (raw.lesoes_recorrentes as string) ?? null,
    observacoes_medicas: (raw.observacoes_medicas as string) ?? null,
    contato_emergencia: (raw.contato_emergencia as string) ?? null,
    telefone_emergencia: (raw.telefone_emergencia as string) ?? null,
    medicacao_continua: (raw.medicacao_continua as string) ?? null,
    restricoes_fisicas: (raw.restricoes_fisicas as string) ?? null,
    saude_privada: raw.saude_privada !== false,
    saude_compartilhar_admins: Boolean(raw.saude_compartilhar_admins),
    ocultar_telefone_emergencia: raw.ocultar_telefone_emergencia !== false,
  }
}

/** Perfil visível para outros usuários — sem dados médicos */
export function toPublicProfile(user: UserProfile): PublicUserProfile {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    foto_url: user.foto_url,
    cidade: user.cidade,
    nivel: user.nivel,
    mao_dominante: user.mao_dominante,
    estilo_jogo: user.estilo_jogo,
    created_at: user.created_at,
  }
}

export const defaultHealthPrivacy = {
  saude_privada: true,
  saude_compartilhar_admins: false,
  ocultar_telefone_emergencia: true,
}
