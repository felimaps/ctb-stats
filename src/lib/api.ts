import { isSupabaseConfigured, supabase } from './supabase'
import { localDb } from './localStorage'
import { normalizeMatch } from './matchUtils'
import type { UserProfile, PublicUserProfile, Match, MatchFormData, Title } from '../types'
import { canRegisterTitle, buildTitlePayload } from './titleSync'
import { normalizeProfile, toPublicProfile, defaultHealthPrivacy } from './profileUtils'

function normalizeMatches(data: unknown[]): Match[] {
  return data.map((m) => normalizeMatch(m as Record<string, unknown>))
}

function matchPayload(form: MatchFormData) {
  return {
    adversario: form.adversario,
    data: form.data,
    placar: form.placar,
    resultado: form.resultado,
    tipo_quadra: form.tipo_quadra,
    duracao: form.duracao ?? null,
    observacoes: form.observacoes ?? null,
    humor_antes: form.humor_antes ?? [],
    corpo_antes: form.corpo_antes ?? [],
    humor_depois: form.humor_depois ?? [],
    corpo_depois: form.corpo_depois ?? [],
    vale_titulo: form.vale_titulo ?? false,
    nome_torneio: form.vale_titulo ? form.nome_torneio?.trim() || null : null,
    categoria_torneio: form.vale_titulo ? form.categoria_torneio?.trim() || null : null,
    nivel_torneio: form.vale_titulo ? form.nivel_torneio ?? null : null,
    fase_partida: form.vale_titulo ? form.fase_partida ?? null : null,
    conquistou_titulo: form.conquistou_titulo ?? false,
    categoria_jogo: form.categoria_jogo ?? null,
    categoria_personalizada:
      form.categoria_jogo === 'outra'
        ? form.categoria_personalizada?.trim() || null
        : null,
  }
}

async function syncTitleFromMatch(
  userId: string,
  matchId: string,
  form: MatchFormData
): Promise<void> {
  if (canRegisterTitle(form)) {
    const payload = buildTitlePayload(userId, form, matchId)
    const existing = await getTitleByMatchId(matchId)
    if (existing) {
      await updateTitle(existing.id, userId, payload)
    } else {
      await createTitle(payload)
    }
  } else {
    await deleteTitlesByMatchId(matchId)
  }
}

export const isDemoMode = !isSupabaseConfigured

// ——— Auth ———

export async function signUp(
  email: string,
  password: string,
  profile: Omit<UserProfile, 'id' | 'email' | 'created_at'>
) {
  if (isDemoMode) return localDb.signUp(email, password, profile)

  const { data: authData, error: authError } = await supabase!.auth.signUp({
    email,
    password,
  })
  if (authError) return { user: null, error: authError.message }
  if (!authData.user) return { user: null, error: 'Erro ao criar conta' }

  const { error: profileError } = await supabase!.from('users').insert({
    id: authData.user.id,
    email,
    nome: profile.nome,
    foto_url: profile.foto_url,
    ...defaultHealthPrivacy,
    cidade: profile.cidade,
    nivel: profile.nivel,
    mao_dominante: profile.mao_dominante,
    estilo_jogo: profile.estilo_jogo,
  })

  if (profileError) return { user: null, error: profileError.message }

  const user = await getProfile(authData.user.id)
  return { user, error: null }
}

export async function signIn(email: string, password: string) {
  if (isDemoMode) return localDb.signIn(email, password)

  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  })
  if (error) return { user: null, error: error.message }
  const user = await getProfile(data.user.id)
  return { user, error: null }
}

export async function signOut() {
  if (isDemoMode) {
    localDb.signOut()
    return
  }
  await supabase!.auth.signOut()
}

export async function getSessionUserId(): Promise<string | null> {
  if (isDemoMode) return localDb.getSession()

  const {
    data: { session },
  } = await supabase!.auth.getSession()
  return session?.user.id ?? null
}

// ——— Profile ———

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isDemoMode) {
    const u = await localDb.getProfile(userId)
    return u ? normalizeProfile(u as unknown as Record<string, unknown>) : null
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return normalizeProfile(data as Record<string, unknown>)
}

export async function updateProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> {
  if (isDemoMode) {
    const u = await localDb.updateProfile(userId, data)
    return u ? normalizeProfile(u as unknown as Record<string, unknown>) : null
  }

  const { data: updated, error } = await supabase!
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) return null
  return normalizeProfile(updated as Record<string, unknown>)
}

export async function getAllProfiles(): Promise<PublicUserProfile[]> {
  if (isDemoMode) {
    const all = await localDb.getAllProfiles()
    return all.map((u) => toPublicProfile(normalizeProfile(u as unknown as Record<string, unknown>)))
  }

  const { data } = await supabase!.from('users').select(
    'id, nome, email, foto_url, cidade, nivel, mao_dominante, estilo_jogo, created_at'
  )
  return (data ?? []).map((row) =>
    toPublicProfile(normalizeProfile(row as Record<string, unknown>))
  )
}

export { uploadAvatar } from './storage'
export { removeAvatarFile } from './storage'

// ——— Matches ———

export async function getUserMatches(userId: string): Promise<Match[]> {
  if (isDemoMode)
    return normalizeMatches(
      (await localDb.getMatches(userId)) as unknown as Record<string, unknown>[]
    )

  const { data } = await supabase!
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })

  return normalizeMatches(data ?? [])
}

export async function getAllMatches(): Promise<Match[]> {
  if (isDemoMode)
    return normalizeMatches(
      (await localDb.getMatches()) as unknown as Record<string, unknown>[]
    )

  const { data } = await supabase!
    .from('matches')
    .select('*')
    .order('data', { ascending: false })

  return normalizeMatches(data ?? [])
}

export async function getMatch(matchId: string): Promise<Match | null> {
  if (isDemoMode) {
    const m = await localDb.getMatch(matchId)
    return m ? normalizeMatch(m as unknown as Record<string, unknown>) : null
  }

  const { data } = await supabase!
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  return data ? normalizeMatch(data as Record<string, unknown>) : null
}

export async function createMatch(
  userId: string,
  form: MatchFormData
): Promise<Match | null> {
  const payload = matchPayload(form)

  if (isDemoMode) {
    const match = await localDb.createMatch(userId, payload)
    await syncTitleFromMatch(userId, match.id, form)
    return match
  }

  const { data, error } = await supabase!
    .from('matches')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()

  if (error) return null
  const match = normalizeMatch(data as Record<string, unknown>)
  await syncTitleFromMatch(userId, match.id, form)
  return match
}

export async function updateMatch(
  matchId: string,
  userId: string,
  form: MatchFormData
): Promise<Match | null> {
  const payload = matchPayload(form)

  if (isDemoMode) {
    const match = await localDb.updateMatch(matchId, userId, payload)
    if (match) await syncTitleFromMatch(userId, matchId, form)
    return match
  }

  const { data, error } = await supabase!
    .from('matches')
    .update(payload)
    .eq('id', matchId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return null
  const match = normalizeMatch(data as Record<string, unknown>)
  await syncTitleFromMatch(userId, matchId, form)
  return match
}

export async function deleteMatch(
  matchId: string,
  userId: string
): Promise<boolean> {
  if (isDemoMode) {
    const ok = await localDb.deleteMatch(matchId, userId)
    return ok
  }

  await deleteTitlesByMatchId(matchId)

  const { error } = await supabase!
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('user_id', userId)

  return !error
}

// ——— Titles ———

export async function getUserTitles(userId: string): Promise<Title[]> {
  if (isDemoMode) return localDb.getTitles(userId)

  const { data } = await supabase!
    .from('titles')
    .select('*')
    .eq('user_id', userId)
    .order('data_titulo', { ascending: false })

  return (data ?? []) as Title[]
}

export async function getAllTitles(): Promise<Title[]> {
  if (isDemoMode) return localDb.getTitles()

  const { data } = await supabase!
    .from('titles')
    .select('*')
    .order('data_titulo', { ascending: false })

  return (data ?? []) as Title[]
}

async function createTitle(data: Omit<Title, 'id' | 'created_at'>): Promise<Title> {
  if (isDemoMode) return localDb.createTitle(data)

  const { data: row, error } = await supabase!
    .from('titles')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return row as Title
}

async function updateTitle(
  titleId: string,
  userId: string,
  data: Partial<Omit<Title, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  if (isDemoMode) {
    await localDb.updateTitle(titleId, userId, data)
    return
  }

  await supabase!.from('titles').update(data).eq('id', titleId).eq('user_id', userId)
}

async function getTitleByMatchId(matchId: string): Promise<Title | null> {
  if (isDemoMode) return localDb.getTitleByMatchId(matchId)

  const { data } = await supabase!
    .from('titles')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()

  return (data as Title) ?? null
}

async function deleteTitlesByMatchId(matchId: string): Promise<void> {
  if (isDemoMode) {
    await localDb.deleteTitlesByMatchId(matchId)
    return
  }

  await supabase!.from('titles').delete().eq('match_id', matchId)
}

// ——— Likes ———

export async function toggleLike(
  matchId: string,
  userId: string
): Promise<boolean> {
  if (isDemoMode) return localDb.toggleLike(matchId, userId)

  const { data: existing } = await supabase!
    .from('likes')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase!.from('likes').delete().eq('id', existing.id)
    return false
  }

  await supabase!.from('likes').insert({ match_id: matchId, user_id: userId })
  return true
}

export async function getLikesInfo(
  matchIds: string[],
  userId?: string
): Promise<{ counts: Record<string, number>; liked: Set<string> }> {
  if (isDemoMode) return localDb.getLikesForMatches(matchIds, userId)

  const { data } = await supabase!
    .from('likes')
    .select('*')
    .in('match_id', matchIds)

  const counts: Record<string, number> = {}
  const liked = new Set<string>()
  for (const id of matchIds) counts[id] = 0

  for (const like of data ?? []) {
    counts[like.match_id] = (counts[like.match_id] ?? 0) + 1
    if (userId && like.user_id === userId) liked.add(like.match_id)
  }

  return { counts, liked }
}

// Ranking: agrega partidas de todos os usuários
export async function getRanking(): Promise<
  { user: PublicUserProfile; vitorias: number; derrotas: number; pontuacao: number }[]
> {
  const profiles = await getAllProfiles()
  const allMatches = await getAllMatches()

  return profiles
    .map((user) => {
      const partidas = allMatches.filter((m) => m.user_id === user.id)
      const vitorias = partidas.filter((p) => p.resultado === 'vitoria').length
      const derrotas = partidas.length - vitorias
      return {
        user,
        vitorias,
        derrotas,
        pontuacao: vitorias * 10 + derrotas * 2,
      }
    })
    .filter((r) => r.vitorias + r.derrotas > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao)
}
