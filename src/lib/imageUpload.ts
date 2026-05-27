const MAX_BYTES = 5 * 1024 * 1024
const OUTPUT_SIZE = 400
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WEBP.'
  }
  if (file.size > MAX_BYTES) {
    return 'Imagem muito grande. Máximo 5 MB.'
  }
  return null
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível carregar a imagem'))
    }
    img.src = url
  })
}

/** Recorte central quadrado + redimensionamento + compressão WebP */
export async function processAvatarImage(file: File): Promise<Blob> {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  const img = await loadImage(file)
  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Erro ao processar imagem')

  ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.85)
  )

  if (!blob) throw new Error('Falha na compressão da imagem')
  return blob
}

export function blobPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}
