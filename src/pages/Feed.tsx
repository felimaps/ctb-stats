import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Heart, Trophy } from 'lucide-react'
import { UserAvatar } from '../components/profile/UserAvatar'
import { PageHeader } from '../components/ui/PageHeader'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { FeedItem } from '../types'
import { RESULTADO_LABELS } from '../types'

export function Feed() {
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeed = async () => {
    setLoading(true)
    const [matches, profiles] = await Promise.all([
      api.getAllMatches(),
      api.getAllProfiles(),
    ])
    const profileMap = new Map(profiles.map((p) => [p.id, p]))
    const matchIds = matches.map((m) => m.id)
    const { counts, liked } = await api.getLikesInfo(matchIds, user?.id)

    const feed: FeedItem[] = matches.slice(0, 50).map((m) => {
      const jogador = profileMap.get(m.user_id)
      const destaque_titulo = Boolean(
        m.conquistou_titulo && m.vale_titulo && m.resultado === 'vitoria'
      )
      return {
        ...m,
        jogador_nome: jogador?.nome ?? 'Jogador',
        jogador_foto: jogador?.foto_url ?? null,
        likes_count: counts[m.id] ?? 0,
        user_liked: liked.has(m.id),
        destaque_titulo,
      }
    })
    setItems(feed)
    setLoading(false)
  }

  useEffect(() => {
    loadFeed()
  }, [user?.id])

  const handleLike = async (matchId: string) => {
    if (!user) return
    await api.toggleLike(matchId, user.id)
    await loadFeed()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto lg:max-w-xl">
      <PageHeader title="Feed" subtitle="Atividade recente da comunidade" />

      {items.length === 0 ? (
        <div className="text-center py-12 text-ctb-muted text-sm">
          Nenhuma partida no feed ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl bg-white p-4 transition-all duration-200 hover:shadow-sm ${
                item.destaque_titulo
                  ? 'border border-amber-100 shadow-[0_1px_3px_rgba(251,191,36,0.08)]'
                  : 'border border-ctb-border'
              }`}
            >
              {item.destaque_titulo && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-50">
                  <Trophy className="h-4 w-4 text-amber-500 shrink-0" strokeWidth={2} />
                  <p className="text-sm text-ctb-dark leading-snug">
                    <strong>{item.jogador_nome}</strong> conquistou{' '}
                    <strong>{item.nome_torneio}</strong>
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <UserAvatar
                  user={{
                    nome: item.jogador_nome,
                    foto_url: item.jogador_foto,
                  }}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ctb-muted">
                    <span className="font-semibold text-ctb-dark">{item.jogador_nome}</span>
                    {' '}
                    {item.resultado === 'vitoria' ? 'venceu' : 'perdeu de'}{' '}
                    <span className="font-medium text-ctb-dark">{item.adversario}</span>
                  </p>
                  <p className="text-xl font-bold text-ctb-dark mt-1 tabular-nums tracking-tight">
                    {item.placar}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.resultado === 'vitoria'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {RESULTADO_LABELS[item.resultado]}
                    </span>
                    <span className="text-xs text-ctb-muted">
                      {format(parseISO(item.data), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center">
                <button
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 ${
                    item.user_liked ? 'text-red-400' : 'text-ctb-muted hover:text-red-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${item.user_liked ? 'fill-current' : ''}`} />
                  {item.likes_count > 0 && item.likes_count}
                  <span className="sr-only">Curtir</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
