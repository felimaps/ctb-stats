import { useRef, useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { processAvatarImage, blobPreviewUrl, validateImageFile } from '../../lib/imageUpload'
import { uploadAvatar } from '../../lib/storage'
import { UserAvatar } from './UserAvatar'
import type { UserProfile } from '../../types'

interface PhotoUploadProps {
  user: UserProfile
  onUploaded: (fotoUrl: string) => void
  onRemoved?: () => void
}

export function PhotoUpload({ user, onUploaded, onRemoved }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File | null) => {
    if (!file) return
    setError(null)
    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }
    try {
      const blob = await processAvatarImage(file)
      if (preview) URL.revokeObjectURL(preview)
      setPendingBlob(blob)
      setPreview(blobPreviewUrl(blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao processar imagem')
    }
  }

  const handleSave = async () => {
    if (!pendingBlob) return
    setUploading(true)
    setError(null)
    const { url, error: err } = await uploadAvatar(user.id, pendingBlob)
    setUploading(false)
    if (err || !url) {
      setError(err ?? 'Falha no upload')
      return
    }
    onUploaded(url)
    setPendingBlob(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const cancelPreview = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setPendingBlob(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <UserAvatar
          user={{
            nome: user.nome,
            foto_url: preview ?? user.foto_url,
          }}
          size="xl"
        />
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2 w-full sm:w-auto"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-4 w-4" />
            Escolher foto
          </Button>
          <p className="text-xs text-slate-500 text-center sm:text-left">
            JPG, PNG ou WEBP · máx. 5 MB · recorte quadrado automático
          </p>
        </div>
      </div>

      {preview && (
        <div className="rounded-xl border border-court-200 bg-court-50/50 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Preview (quadrado, comprimido)</p>
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-32 rounded-2xl object-cover border-2 border-white shadow"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Salvar foto'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelPreview}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {user.foto_url && !preview && onRemoved && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-500"
          onClick={onRemoved}
        >
          Remover foto atual
        </Button>
      )}
    </div>
  )
}
