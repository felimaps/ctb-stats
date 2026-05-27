import { useState, useCallback, useEffect } from 'react'
import type { Match, MatchFormData, Title } from '../types'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function useMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [titles, setTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setMatches([])
      setTitles([])
      setLoading(false)
      return
    }
    setLoading(true)
    const [data, userTitles] = await Promise.all([
      api.getUserMatches(user.id),
      api.getUserTitles(user.id),
    ])
    setMatches(data)
    setTitles(userTitles)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const create = async (form: MatchFormData) => {
    if (!user) return null
    const match = await api.createMatch(user.id, form)
    await load()
    return match
  }

  const update = async (matchId: string, form: MatchFormData) => {
    if (!user) return null
    const match = await api.updateMatch(matchId, user.id, form)
    await load()
    return match
  }

  const remove = async (matchId: string) => {
    if (!user) return false
    const ok = await api.deleteMatch(matchId, user.id)
    if (ok) await load()
    return ok
  }

  return { matches, titles, loading, reload: load, create, update, remove }
}
