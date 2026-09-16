import { useEffect, useRef, useState, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import { fileToDataUrl } from '../lib/imageUtils'

const FRAME = 300 // on-screen crop frame size in px
const OUTPUT = 512 // exported image size in px

export default function ImageCropperModal({ file, onCancel, onCropped }) {
  const imgRef = useRef(null)
  const [natural, setNatural] = useState(null) // { w, h } of the actual image, once loaded
  const [zoom, setZoom] = useState(1)
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const dragState = useRef(null) // { startX, startY, origin }

  // Data URLs (base64) are used instead of blob: object URLs — some browser
  // configurations and embedded webviews block blob: URLs as <img> sources,
  // which left this modal stuck on "Loading..." forever. Data URLs always work.
  const [imageSrc, setImageSrc] = useState(null)

  useEffect(() => {
    let active = true
    setImageSrc(null)
    setNatural(null)
    fileToDataUrl(file).then((dataUrl) => {
      if (active) setImageSrc(dataUrl)
    })
    return () => {
      active = false
    }
  }, [file])

  // Scale that makes the image's SHORT side exactly cover the frame at zoom=1.
  const baseFit = natural ? FRAME / Math.min(natural.w, natural.h) : 0
  const scale = baseFit * zoom
  const dw = natural ? natural.w * scale : 0
  const dh = natural ? natural.h * scale : 0

  const clampDrag = useCallback((next, currentDw, currentDh) => {
    const maxX = Math.max(0, (currentDw - FRAME) / 2)
    const maxY = Math.max(0, (currentDh - FRAME) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    }
  }, [])

  const handleLoad = (e) => {
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  // Dragging is done with plain mouse/touch listeners attached to `window`
  // instead of the Pointer Events API — this is the approach that behaves
  // consistently across browsers/devices without relying on pointer capture.
  const startDrag = (clientX, clientY) => {
    dragState.current = { startX: clientX, startY: clientY, origin: drag }
  }

  const moveDrag = useCallback(
    (clientX, clientY) => {
      if (!dragState.current || !natural) return
      const dx = clientX - dragState.current.startX
      const dy = clientY - dragState.current.startY
      setDrag(clampDrag({ x: dragState.current.origin.x + dx, y: dragState.current.origin.y + dy }, dw, dh))
    },
    [natural, dw, dh, clampDrag]
  )

  const endDrag = () => {
    dragState.current = null
  }

  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = () => endDrag()
    const onTouchMove = (e) => {
      if (!dragState.current) return
      e.preventDefault()
      const t = e.touches[0]
      if (t) moveDrag(t.clientX, t.clientY)
    }
    const onTouchEnd = () => endDrag()

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [moveDrag])

  const handleMouseDown = (e) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }
  const handleTouchStart = (e) => {
    const t = e.touches[0]
    if (t) startDrag(t.clientX, t.clientY)
  }

  const handleZoom = (e) => {
    const nextZoom = Number(e.target.value)
    if (!natural) {
      setZoom(nextZoom)
      return
    }
    const nextScale = baseFit * nextZoom
    setZoom(nextZoom)
    setDrag((d) => clampDrag(d, natural.w * nextScale, natural.h * nextScale))
  }

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img || !natural) return

    // The frame's visible window, expressed in this image's own pixel space.
    const localX = dw / 2 - FRAME / 2 - drag.x
    const localY = dh / 2 - FRAME / 2 - drag.y
    const sSize = FRAME / scale
    const sx = Math.min(Math.max(localX / scale, 0), Math.max(0, natural.w - sSize))
    const sy = Math.min(Math.max(localY / scale, 0), Math.max(0, natural.h - sSize))

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT)

    canvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob)
      },
      'image/jpeg',
      0.92
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-inverse-surface/70 flex items-center justify-center p-4">
      <div className="bg-warm-white border-2 border-on-surface paper-shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">Position Your Photo</h2>
          <button type="button" onClick={onCancel} className="p-1 hover:text-primary">
            <FiX size={20} />
          </button>
        </div>

        <div
          className="relative mx-auto overflow-hidden border-2 border-on-surface bg-surface-container-high select-none"
          style={{ width: FRAME, height: FRAME, borderRadius: '9999px', cursor: 'grab', touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            ref={imgRef}
            src={imageSrc || undefined}
            alt="Crop preview"
            draggable={false}
            onLoad={handleLoad}
            style={
              natural
                ? {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${dw}px`,
                    height: `${dh}px`,
                    transform: `translate(-50%, -50%) translate(${drag.x}px, ${drag.y}px)`,
                    maxWidth: 'none',
                    pointerEvents: 'none',
                  }
                : { opacity: 0, position: 'absolute' }
            }
          />
          {!natural && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-on-surface-variant">
              Loading...
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <span className="text-xs text-on-surface-variant">Zoom</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={handleZoom}
            disabled={!natural}
            className="flex-1 accent-[#8a4b32]"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} className="btn-secondary label-caps px-5 py-2 flex-1 paper-shadow-sm paper-interactive">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!natural}
            className="btn-primary label-caps px-5 py-2 flex-1 paper-shadow-sm paper-interactive disabled:opacity-50"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  )
}
