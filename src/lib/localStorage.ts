import type { UserProfile, Match, Like, Title } from '../types'

const KEYS = {
  users: 'ctb_users',
  matches: 'ctb_matches',
  likes: 'ctb_likes',
  titles: 'ctb_titles',
  session: 'ctb_session',
} as const

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

function uid() {
  return crypto.randomUUID()
}

export const localDb = {
  getSession(): string | null {
    return localStorage.getItem(KEYS.session)
  },

  setSession(userId: string | null) {
    if (userId) localStorage.setItem(KEYS.session, userId)
    else localStorage.removeItem(KEYS.session)
  },

  async signUp(
    email: string,
    password: string,
    profile: Omit<UserProfile, 'id' | 'email' | 'created_at'>
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    const users = read<UserProfile & { password: string }>(KEYS.users)
    if (users.some((u) => u.email === email)) {
      return { user: null, error: 'E-mail já cadastrado' }
    }
    const user: UserProfile & { password: string } = {
      id: uid(),
      email,
      password,
      created_at: new Date().toISOString(),
      ...profile,
    }
    users.push(user)
    write(KEYS.users, users)
    localDb.setSession(user.id)
    const { password: _, ...publicUser } = user
    return { user: publicUser, error: null }
  },

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: UserProfile | null; error: string | null }> {
    const users = read<UserProfile & { password: string }>(KEYS.users)
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) return { user: null, error: 'E-mail ou senha incorretos' }
    localDb.setSession(found.id)
    const { password: _, ...publicUser } = found
    return { user: publicUser, error: null }
  },

  signOut() {
    localDb.setSession(null)
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const users = read<UserProfile & { password?: string }>(KEYS.users)
    const u = users.find((x) => x.id === userId)
    if (!u) return null
    const { password: _, ...profile } = u
    return profile
  },

  async updateProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const users = read<UserProfile & { password: string }>(KEYS.users)
    const idx = users.findIndex((u) => u.id === userId)
    if (idx < 0) return null
    users[idx] = { ...users[idx], ...data, id: userId, email: users[idx].email }
    write(KEYS.users, users)
    const { password: _, ...profile } = users[idx]
    return profile
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    return read<UserProfile & { password?: string }>(KEYS.users).map(
      ({ password: _, ...u }) => u
    )
  },

  async getMatches(userId?: string): Promise<Match[]> {
    const all = read<Match>(KEYS.matches)
    if (userId) return all.filter((m) => m.user_id === userId)
    return all.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )
  },

  async createMatch(
    userId: string,
    data: Omit<Match, 'id' | 'user_id' | 'created_at'>
  ): Promise<Match> {
    const matches = read<Match>(KEYS.matches)
    const match: Match = {
      id: uid(),
      user_id: userId,
      created_at: new Date().toISOString(),
      ...data,
    }
    matches.push(match)
    write(KEYS.matches, matches)
    return match
  },

  async updateMatch(
    matchId: string,
    userId: string,
    data: Partial<Match>
  ): Promise<Match | null> {
    const matches = read<Match>(KEYS.matches)
    const idx = matches.findIndex((m) => m.id === matchId && m.user_id === userId)
    if (idx < 0) return null
    matches[idx] = { ...matches[idx], ...data }
    write(KEYS.matches, matches)
    return matches[idx]
  },

  async deleteMatch(matchId: string, userId: string): Promise<boolean> {
    const matches = read<Match>(KEYS.matches)
    const filtered = matches.filter(
      (m) => !(m.id === matchId && m.user_id === userId)
    )
    if (filtered.length === matches.length) return false
    write(KEYS.matches, filtered)
    const likes = read<Like>(KEYS.likes).filter((l) => l.match_id !== matchId)
    write(KEYS.likes, likes)
    await localDb.deleteTitlesByMatchId(matchId)
    return true
  },

  async getTitles(userId?: string): Promise<Title[]> {
    const all = read<Title>(KEYS.titles)
    const list = userId ? all.filter((t) => t.user_id === userId) : all
    return list.sort(
      (a, b) => new Date(b.data_titulo).getTime() - new Date(a.data_titulo).getTime()
    )
  },

  async createTitle(data: Omit<Title, 'id' | 'created_at'>): Promise<Title> {
    const titles = read<Title>(KEYS.titles)
    const title: Title = {
      id: uid(),
      created_at: new Date().toISOString(),
      ...data,
    }
    titles.push(title)
    write(KEYS.titles, titles)
    return title
  },

  async updateTitle(
    titleId: string,
    userId: string,
    data: Partial<Omit<Title, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Title | null> {
    const titles = read<Title>(KEYS.titles)
    const idx = titles.findIndex((t) => t.id === titleId && t.user_id === userId)
    if (idx < 0) return null
    titles[idx] = { ...titles[idx], ...data }
    write(KEYS.titles, titles)
    return titles[idx]
  },

  async updateTitleByMatchId(
    matchId: string,
    data: Partial<Omit<Title, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Title | null> {
    const titles = read<Title>(KEYS.titles)
    const idx = titles.findIndex((t) => t.match_id === matchId)
    if (idx < 0) return null
    titles[idx] = { ...titles[idx], ...data }
    write(KEYS.titles, titles)
    return titles[idx]
  },

  async deleteTitlesByMatchId(matchId: string): Promise<void> {
    const titles = read<Title>(KEYS.titles).filter((t) => t.match_id !== matchId)
    write(KEYS.titles, titles)
  },

  async getTitleByMatchId(matchId: string): Promise<Title | null> {
    return read<Title>(KEYS.titles).find((t) => t.match_id === matchId) ?? null
  },

  async getMatch(matchId: string): Promise<Match | null> {
    return read<Match>(KEYS.matches).find((m) => m.id === matchId) ?? null
  },

  async toggleLike(matchId: string, userId: string): Promise<boolean> {
    const likes = read<Like>(KEYS.likes)
    const existing = likes.find(
      (l) => l.match_id === matchId && l.user_id === userId
    )
    if (existing) {
      write(
        KEYS.likes,
        likes.filter((l) => l.id !== existing.id)
      )
      return false
    }
    likes.push({ id: uid(), match_id: matchId, user_id: userId })
    write(KEYS.likes, likes)
    return true
  },

  async getLikesForMatches(
    matchIds: string[],
    userId?: string
  ): Promise<{ counts: Record<string, number>; liked: Set<string> }> {
    const likes = read<Like>(KEYS.likes)
    const counts: Record<string, number> = {}
    const liked = new Set<string>()
    for (const id of matchIds) {
      const matchLikes = likes.filter((l) => l.match_id === id)
      counts[id] = matchLikes.length
      if (userId && matchLikes.some((l) => l.user_id === userId)) {
        liked.add(id)
      }
    }
    return { counts, liked }
  },
}
