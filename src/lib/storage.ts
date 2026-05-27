import { getSupabase } from './supabase'
import { mapDbError } from './authErrors'

export async function uploadAvatar(
  userId: string,
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  const path = `${userId}/avatar.webp`

  const { error: uploadError } = await getSupabase().storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '3600',
  })

  if (uploadError) {
    return { url: null, error: mapDbError(uploadError.message) }
  }

  const { data } = getSupabase().storage.from('avatars').getPublicUrl(path)
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`
  return { url: publicUrl, error: null }
}

export async function removeAvatarFile(userId: string): Promise<void> {
  await getSupabase().storage.from('avatars').remove([`${userId}/avatar.webp`])
}
