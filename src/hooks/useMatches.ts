import { useState, useCallback, useEffect } from 'react'
import type { Match, MatchFormData, Title } from '../types'
import * as api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function useMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [titles, setTitles] = useState<Title[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setMatches([])
      setTitles([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
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
    if (!user) return { match: null, error: 'Faça login para registrar partidas.' }
    const { match, error: err } = await api.createMatch(user.id, form)
    if (err) setError(err)
    if (match) await load()
    return { match, error: err }
  }

  const update = async (matchId: string, form: MatchFormData) => {
    if (!user) return { match: null, error: 'Faça login para editar partidas.' }
    const { match, error: err } = await api.updateMatch(matchId, user.id, form)
    if (err) setError(err)
    if (match) await load()
    return { match, error: err }
  }

  const remove = async (matchId: string) => {
    if (!user) return false
    const ok = await api.deleteMatch(matchId, user.id)
    if (ok) await load()
    return ok
  }

  return { matches, titles, loading, error, reload: load, create, update, remove }
}
