'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type FoundItemGalleryProps = {
  alt: string
  images: string[]
  extraCount?: number
}

export function FoundItemGallery({ alt, images, extraCount }: FoundItemGalleryProps) {
  const [active, setActive] = useState(0)
  const main = images[active] ?? images[0]

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-4 border-black bg-muted shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <img src={main} alt={alt} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              'relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black',
              active === i && 'ring-2 ring-black ring-offset-2',
            )}
            aria-label={`View image ${i + 1}`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {extraCount != null && extraCount > 0 ? (
          <div
            className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-black bg-white/80 text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            aria-hidden
          >
            +{extraCount} more
          </div>
        ) : null}
      </div>
    </div>
  )
}
