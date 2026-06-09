import { useEffect, useMemo, useState } from 'react'

function normalizeImageSrc(src) {
  const t = String(src || '').trim()
  if (!t) return ''
  if (t.startsWith('/') && !t.startsWith('//')) {
    return t
      .split('/')
      .map((seg, i) => (i === 0 ? seg : encodeURIComponent(decodeURIComponent(seg))))
      .join('/')
  }
  return t
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  loading = 'lazy',
  ...rest
}) {
  const fallbacks = useMemo(() => {
    const list = []
    if (fallbackSrc) {
      if (Array.isArray(fallbackSrc)) list.push(...fallbackSrc)
      else list.push(fallbackSrc)
    }
    return list.map(normalizeImageSrc).filter(Boolean)
  }, [fallbackSrc])

  const normalizedSrc = useMemo(() => normalizeImageSrc(src), [src])
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc)
  const [fallbackIndex, setFallbackIndex] = useState(0)

  useEffect(() => {
    setCurrentSrc(normalizedSrc)
    setFallbackIndex(0)
  }, [normalizedSrc])

  const onError = () => {
    if (fallbackIndex >= fallbacks.length) return
    const next = fallbacks[fallbackIndex]
    setFallbackIndex((i) => i + 1)
    setCurrentSrc(next)
  }

  if (!currentSrc) return null

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={onError}
      {...rest}
    />
  )
}

