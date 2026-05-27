import type { PublicUserProfile } from '../../types'

interface UserAvatarProps {
  user: Pick<PublicUserProfile, 'nome' | 'foto_url'> | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs rounded-full',
  md: 'h-10 w-10 text-sm rounded-full',
  lg: 'h-14 w-14 text-lg rounded-2xl',
  xl: 'h-20 w-20 text-3xl rounded-2xl',
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const nome = user?.nome ?? '?'
  const foto = user?.foto_url

  return (
    <div
      className={`shrink-0 bg-ctb-light flex items-center justify-center font-bold text-ctb-primary overflow-hidden ${sizes[size]} ${className}`}
    >
      {foto ? (
        <img src={foto} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        nome.charAt(0).toUpperCase()
      )}
    </div>
  )
}
