import { useState, useEffect } from 'react'
import { FiUser } from 'react-icons/fi'

const SIZES = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-10 h-10',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24 md:w-28 md:h-28',
}

const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 28,
  xl: 34,
}

export default function Avatar({ src, size = 'md', rounded = 'full', className = '' }) {
  const [failed, setFailed] = useState(false)

  // Reset the "failed" flag whenever a new src comes in (e.g. after
  // removing/replacing a photo), so it gets a fresh chance to load.
  useEffect(() => {
    setFailed(false)
  }, [src])

  const shape = rounded === 'full' ? 'rounded-full' : ''
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`${SIZES[size]} ${shape} border-2 border-on-surface bg-secondary-container overflow-hidden shrink-0 flex items-center justify-center ${className}`}
    >
      {showImage ? (
        <img src={src} alt="" className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <FiUser size={ICON_SIZES[size]} className="text-on-secondary-container" />
      )}
    </div>
  )
}
