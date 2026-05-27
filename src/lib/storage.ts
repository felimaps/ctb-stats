import { isSupabaseConfigured, supabase } from './supabase'
import { localDb } from './localStorage'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function uploadAvatar(
  userId: string,
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    try {
      const dataUrl = await blobToDataUrl(blob)
      await localDb.updateProfile(userId, { foto_url: dataUrl })
      return { url: dataUrl, error: null }
    } catch {
      return { url: null, error: 'Erro ao salvar foto localmente' }
    }
  }

  const path = `${userId}/avatar.webp`

  const { error: uploadError } = await supabase!.storage
    .from('avatars')
    .upload(path, blob, {
      upsert: true,
      contentType: 'image/webp',
      cacheControl: '3600',
    })

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase!.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

export async function removeAvatarFile(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return
  await supabase!.storage.from('avatars').remove([`${userId}/avatar.webp`])
}
