import { useCallback, useEffect, useRef, useState } from 'react'
import { makeT } from '../i18n/ui.js'
import { useEscapeKey } from '../hooks/useEscapeKey.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

// Reusable free-floating CRT window. On desktop it's draggable by the header
// and resizable from the bottom-right corner, and it is NON-MODAL: there's no
// blocking backdrop, so the player can keep typing at the prompt behind it.
// On mobile (where drag + resize don't fit a phone) it falls back to a
// centered modal with a backdrop. Shared by HelpPopup and FileViewer so both
// behave identically.
//
// The caller supplies the chrome content (title, footer) and the body via
// children; this component owns the window behavior and layout.

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export default function FloatingWindow({
  title,
  t = makeT('en'),
  onClose,
  children,
  footer = null,
  className = '',
  bodyClassName = '',
  initialSize = { w: 480, h: 420 },
  minSize = { w: 320, h: 200 },
  anchor = 'top-right', // 'top-right' | 'center'
  ariaLabel
}) {
  const isMobile = useIsMobile()
  useEscapeKey(onClose)

  // Position/size are only meaningful on desktop; on mobile the CSS centers it.
  const [pos, setPos] = useState(null)
  const [size, setSize] = useState(initialSize)
  const dragRef = useRef(null) // { startX, startY, originX, originY }
  const resizeRef = useRef(null) // { startX, startY, originW, originH }

  // Compute an initial position once mounted on desktop.
  useEffect(() => {
    if (isMobile || pos) return
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    if (anchor === 'center') {
      setPos({
        x: Math.max(20, Math.round((vw - initialSize.w) / 2)),
        y: Math.max(20, Math.round((vh - initialSize.h) / 2))
      })
    } else {
      // Anchor near the top-right of the CRT so the prompt at the bottom stays
      // visible and the window doesn't cover the most-recent output.
      setPos({
        x: Math.max(40, vw - initialSize.w - 80),
        y: Math.max(40, Math.floor(vh * 0.1))
      })
    }
  }, [isMobile, pos, anchor, initialSize.w, initialSize.h])

  const onHeaderPointerDown = useCallback(
    (e) => {
      if (isMobile) return
      if (e.button !== undefined && e.button !== 0) return
      // Don't start a drag when the pointer lands on the close button.
      if (e.target.closest?.('.floating-window__close')) return
      const cur = pos ?? { x: 0, y: 0 }
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: cur.x,
        originY: cur.y
      }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      e.preventDefault()
    },
    [isMobile, pos]
  )

  const onHeaderPointerMove = useCallback(
    (e) => {
      const d = dragRef.current
      if (!d) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      const vw = window.innerWidth
      const vh = window.innerHeight
      // Keep at least part of the header on-screen so it can always be grabbed.
      setPos({
        x: clamp(d.originX + dx, -size.w + 80, vw - 24),
        y: clamp(d.originY + dy, 0, vh - 40)
      })
    },
    [size.w]
  )

  const endHeaderDrag = useCallback((e) => {
    dragRef.current = null
    e.currentTarget?.releasePointerCapture?.(e.pointerId)
  }, [])

  const onResizePointerDown = useCallback(
    (e) => {
      if (isMobile) return
      if (e.button !== undefined && e.button !== 0) return
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        originW: size.w,
        originH: size.h
      }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      e.preventDefault()
      e.stopPropagation()
    },
    [isMobile, size.w, size.h]
  )

  const onResizePointerMove = useCallback(
    (e) => {
      const r = resizeRef.current
      if (!r) return
      const dx = e.clientX - r.startX
      const dy = e.clientY - r.startY
      const vw = window.innerWidth
      const vh = window.innerHeight
      setSize({
        w: clamp(r.originW + dx, minSize.w, vw - 80),
        h: clamp(r.originH + dy, minSize.h, vh - 80)
      })
    },
    [minSize.w, minSize.h]
  )

  const endResize = useCallback((e) => {
    resizeRef.current = null
    e.currentTarget?.releasePointerCapture?.(e.pointerId)
  }, [])

  const desktopStyle =
    !isMobile && pos
      ? { left: pos.x, top: pos.y, width: size.w, height: size.h }
      : undefined

  const cls = `floating-window${isMobile ? ' floating-window--mobile' : ''}${
    className ? ` ${className}` : ''
  }`

  const win = (
    <div
      className={cls}
      style={desktopStyle}
      role="dialog"
      aria-modal={isMobile ? 'true' : 'false'}
      aria-label={ariaLabel ?? title}
    >
      <div
        className="floating-window__header"
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={endHeaderDrag}
        onPointerCancel={endHeaderDrag}
      >
        <span className="floating-window__title">{title}</span>
        <button
          className="floating-window__close"
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={t('viewer.close')}
          title={t('viewer.close')}
        >
          ✕
        </button>
      </div>
      <div className={`floating-window__body${bodyClassName ? ` ${bodyClassName}` : ''}`}>
        {children}
      </div>
      {footer != null && <div className="floating-window__footer">{footer}</div>}
      {!isMobile && (
        <div
          className="floating-window__resize"
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          aria-hidden="true"
        />
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div className="floating-window__backdrop" role="presentation" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>{win}</div>
      </div>
    )
  }
  return win
}
