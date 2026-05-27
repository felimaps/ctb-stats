import { getSupabase } from './supabase'
import { normalizeMatch } from './matchUtils'
import type { UserProfile, PublicUserProfile, Match, MatchFormData, Title } from '../types'
import { canRegisterTitle, buildTitlePayload } from './titleSync'
import { normalizeProfile, toPublicProfile, defaultHealthPrivacy } from './profileUtils'
import { mapAuthError, mapDbError } from './authErrors'

const PROFILES = 'profiles'

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

// ——— Auth ———

export async function signUp(
  email: string,
  password: string,
  profile: Omit<UserProfile, 'id' | 'email' | 'created_at'>
): Promise<{ user: UserProfile | null; error: string | null }> {
  const sb = getSupabase()

  const { data: authData, error: authError } = await sb.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        nome: profile.nome,
        cidade: profile.cidade,
        nivel: profile.nivel,
        mao_dominante: profile.mao_dominante,
        estilo_jogo: profile.estilo_jogo,
      },
    },
  })

  if (authError) return { user: null, error: mapAuthError(authError.message) }
  if (!authData.user) return { user: null, error: 'Erro ao criar conta. Tente novamente.' }

  const { error: profileError } = await sb.from(PROFILES).upsert(
    {
      id: authData.user.id,
      email: email.trim(),
      nome: profile.nome,
      foto_url: profile.foto_url,
      cidade: profile.cidade,
      nivel: profile.nivel,
      mao_dominante: profile.mao_dominante,
      estilo_jogo: profile.estilo_jogo,
      ...defaultHealthPrivacy,
    },
    { onConflict: 'id' }
  )

  if (profileError) {
    return { user: null, error: mapDbError(profileError.message) }
  }

  if (!authData.session) {
    return {
      user: null,
      error:
        'Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.',
    }
  }

  const user = await getProfile(authData.user.id)
  return { user, error: null }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  const sb = getSupabase()

  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) return { user: null, error: mapAuthError(error.message) }
  const user = await getProfile(data.user.id)
  if (!user) {
    return {
      user: null,
      error: 'Perfil não encontrado. Execute o setup do banco no Supabase ou cadastre-se novamente.',
    }
  }
  return { user, error: null }
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut()
}

export async function getSessionUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()
  return session?.user.id ?? null
}

// ——— Profile ———

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from(PROFILES)
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return normalizeProfile(data as Record<string, unknown>)
}

export async function updateProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ profile: UserProfile | null; error: string | null }> {
  const { data: updated, error } = await getSupabase()
    .from(PROFILES)
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) return { profile: null, error: mapDbError(error.message) }
  return {
    profile: normalizeProfile(updated as Record<string, unknown>),
    error: null,
  }
}

export async function getAllProfiles(): Promise<PublicUserProfile[]> {
  const { data, error } = await getSupabase().from(PROFILES).select(
    'id, nome, email, foto_url, cidade, nivel, mao_dominante, estilo_jogo, created_at'
  )

  if (error) {
    console.error('[CTB] getAllProfiles:', error.message)
    return []
  }

  return (data ?? []).map((row) =>
    toPublicProfile(normalizeProfile(row as Record<string, unknown>))
  )
}

export { uploadAvatar } from './storage'
export { removeAvatarFile } from './storage'

// ——— Matches ———

export async function getUserMatches(userId: string): Promise<Match[]> {
  const { data, error } = await getSupabase()
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })

  if (error) {
    console.error('[CTB] getUserMatches:', error.message)
    return []
  }
  return normalizeMatches(data ?? [])
}

export async function getAllMatches(): Promise<Match[]> {
  const { data, error } = await getSupabase()
    .from('matches')
    .select('*')
    .order('data', { ascending: false })

  if (error) {
    console.error('[CTB] getAllMatches:', error.message)
    return []
  }
  return normalizeMatches(data ?? [])
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const { data } = await getSupabase()
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  return data ? normalizeMatch(data as Record<string, unknown>) : null
}

export async function createMatch(
  userId: string,
  form: MatchFormData
): Promise<{ match: Match | null; error: string | null }> {
  const payload = matchPayload(form)

  const { data, error } = await getSupabase()
    .from('matches')
    .insert({ user_id: userId, ...payload })
    .select()
    .single()

  if (error) return { match: null, error: mapDbError(error.message) }

  const match = normalizeMatch(data as Record<string, unknown>)
  await syncTitleFromMatch(userId, match.id, form)
  return { match, error: null }
}

export async function updateMatch(
  matchId: string,
  userId: string,
  form: MatchFormData
): Promise<{ match: Match | null; error: string | null }> {
  const payload = matchPayload(form)

  const { data, error } = await getSupabase()
    .from('matches')
    .update(payload)
    .eq('id', matchId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return { match: null, error: mapDbError(error.message) }

  const match = normalizeMatch(data as Record<string, unknown>)
  await syncTitleFromMatch(userId, matchId, form)
  return { match, error: null }
}

export async function deleteMatch(matchId: string, userId: string): Promise<boolean> {
  await deleteTitlesByMatchId(matchId)

  const { error } = await getSupabase()
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('user_id', userId)

  return !error
}

// ——— Titles ———

export async function getUserTitles(userId: string): Promise<Title[]> {
  const { data } = await getSupabase()
    .from('titles')
    .select('*')
    .eq('user_id', userId)
    .order('data_titulo', { ascending: false })

  return (data ?? []) as Title[]
}

export async function getAllTitles(): Promise<Title[]> {
  const { data } = await getSupabase()
    .from('titles')
    .select('*')
    .order('data_titulo', { ascending: false })

  return (data ?? []) as Title[]
}

async function createTitle(data: Omit<Title, 'id' | 'created_at'>): Promise<Title> {
  const { data: row, error } = await getSupabase()
    .from('titles')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(mapDbError(error.message))
  return row as Title
}

async function updateTitle(
  titleId: string,
  userId: string,
  data: Partial<Omit<Title, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  await getSupabase().from('titles').update(data).eq('id', titleId).eq('user_id', userId)
}

async function getTitleByMatchId(matchId: string): Promise<Title | null> {
  const { data } = await getSupabase()
    .from('titles')
    .select('*')
    .eq('match_id', matchId)
    .maybeSingle()

  return (data as Title) ?? null
}

async function deleteTitlesByMatchId(matchId: string): Promise<void> {
  await getSupabase().from('titles').delete().eq('match_id', matchId)
}

// ——— Likes ———

export async function toggleLike(matchId: string, userId: string): Promise<boolean> {
  const sb = getSupabase()
  const { data: existing } = await sb
    .from('likes')
    .select('id')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await sb.from('likes').delete().eq('id', existing.id)
    return false
  }

  await sb.from('likes').insert({ match_id: matchId, user_id: userId })
  return true
}

export async function getLikesInfo(
  matchIds: string[],
  userId?: string
): Promise<{ counts: Record<string, number>; liked: Set<string> }> {
  const { data } = await getSupabase().from('likes').select('*').in('match_id', matchIds)

  const counts: Record<string, number> = {}
  const liked = new Set<string>()
  for (const id of matchIds) counts[id] = 0

  for (const like of data ?? []) {
    counts[like.match_id] = (counts[like.match_id] ?? 0) + 1
    if (userId && like.user_id === userId) liked.add(like.match_id)
  }

  return { counts, liked }
}

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
