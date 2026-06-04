import { getPublicAssetUrl } from '../../services/mediaAssets'
import { mediaAssetKind } from '../../lib/mediaAssetTypes'

const KIND_BADGE = {
  image: 'Image',
  video: 'Video',
  pdf: 'PDF',
  file: 'File',
}

export function MediaAssetThumb({ asset, className = 'h-36' }) {
  const url = asset?.public_url || getPublicAssetUrl({ asset })
  const kind = mediaAssetKind(asset)
  const label = KIND_BADGE[kind] || 'File'

  return (
    <div className={`relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 ${className}`}>
      {kind === 'image' ? (
        <img src={url} alt={asset?.alt || asset?.title || 'Media'} className="h-full w-full object-cover" loading="lazy" />
      ) : kind === 'video' ? (
        <video src={url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <div className="grid h-full place-content-center px-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">{label}</span>
          <span className="mt-1 break-all text-[10px] text-zinc-500 dark:text-zinc-400">{asset?.mime_type || asset?.path}</span>
        </div>
      )}
      <span className="absolute right-2 top-2 rounded bg-zinc-900/75 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        {label}
      </span>
    </div>
  )
}
