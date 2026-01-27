'use client'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

type IconProps = {
  itemName: string
  alt?: string
  size?: number
  className?: string
}

export function Icon({ itemName, alt, size = 36, className }: IconProps) {
  const encodedName = encodeURIComponent(itemName)
  const sources = [
    `https://render.albiononline.com/v1/item/${encodedName}.png`,
    `https://raw.githubusercontent.com/ao-data/albion-assets/main/icons/items/${encodedName}.png`,
    `https://raw.githubusercontent.com/ao-data/albion-assets/master/icons/items/${encodedName}.png`,
  ]
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [encodedName])

  const src = sources[sourceIndex] ?? sources[0]
  return (
    <img
      src={src}
      alt={alt ?? itemName}
      width={size}
      height={size}
      className={clsx('inline-block', className)}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex(sourceIndex + 1)
        }
      }}
    />
  )
}
