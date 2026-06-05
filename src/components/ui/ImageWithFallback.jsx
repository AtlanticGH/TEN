import { useEffect, useMemo, useState } from 'react'

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
    return list.filter(Boolean)
  }, [fallbackSrc])

  const [currentSrc, setCurrentSrc] = useState(src || '')
  const [fallbackIndex, setFallbackIndex] = useState(0)

  useEffect(() => {
    setCurrentSrc(src || '')
    setFallbackIndex(0)
  }, [src])

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

