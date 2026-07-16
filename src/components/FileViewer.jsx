import { useEffect, useState } from 'react'
import OutputLine from './OutputLine.jsx'
import { renderFileContent } from 'rpgterm-engine'
import { makeT } from '../i18n/ui.js'
import FloatingWindow from './FloatingWindow.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

// Cinematic file reader: `cat` (and the unlocked-file reveals after `crack`,
// `unlock` and `decrypt`) open a file here instead of dumping it inline.
// It uses the shared FloatingWindow chrome, so on desktop it's a draggable,
// resizable, non-modal window (the player can keep typing behind it) and on
// mobile it becomes a centered modal. Content (text, markdown, CRT-filtered
// images) is rendered via the shared renderFileContent so it matches the
// inline look. Close with the × button or Esc.
//
// A file with `image:` front-matter splits in two on desktop: the text opens
// in the reader as usual and the picture opens in a companion window beside
// it, cascaded over the reader's frame but clear of the text column. Both are
// draggable; the companion's × dismisses just the picture, Esc closes
// everything. Closing the reader closes the picture too — both windows are
// children of this component, so unmounting it (Terminal sets fileViewer to
// null) tears down the pair together. On mobile the picture stays inline
// inside the single modal.

const MAIN_SIZE = { w: 640, h: 480 }
const IMG_SIZE = { w: 420, h: 460 }
// Let the reader land first, then bring the picture in a beat later so the
// two windows don't pop in on the same frame. Kept short on purpose.
const IMAGE_DELAY_MS = 150

// Overlap the reader's border by a frame's worth, and cascade down a touch,
// so the pair reads as one workspace without the picture covering prose.
function companionPos() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const mainX = Math.max(20, Math.round((vw - MAIN_SIZE.w) / 2))
  const mainY = Math.max(20, Math.round((vh - MAIN_SIZE.h) / 2))
  return {
    x: Math.min(mainX + MAIN_SIZE.w - 28, vw - IMG_SIZE.w - 12),
    y: Math.min(mainY + 36, vh - IMG_SIZE.h - 12)
  }
}

export default function FileViewer({ path, node, t = makeT('en'), onClose }) {
  const isMobile = useIsMobile()
  const lines = renderFileContent(path, node)
  // Starts closed and opens after a short delay (see effect below). Terminal
  // mounts a fresh FileViewer per open, so this resets naturally.
  const [imageOpen, setImageOpen] = useState(false)

  const imageLine = isMobile ? null : lines.find((l) => l.type === 'image')
  const imageSrc = imageLine?.src ?? null
  const textLines = imageLine ? lines.filter((l) => l.type !== 'image') : lines

  useEffect(() => {
    if (!imageSrc) return undefined
    const id = setTimeout(() => setImageOpen(true), IMAGE_DELAY_MS)
    return () => clearTimeout(id)
  }, [imageSrc])

  return (
    <>
      <FloatingWindow
        title={path}
        t={t}
        onClose={onClose}
        className="floating-window--file"
        initialSize={MAIN_SIZE}
        minSize={{ w: 340, h: 220 }}
        anchor="center"
        footer={t('viewer.hint')}
      >
        {textLines.map((line, i) => (
          <OutputLine key={i} line={{ ...line, instant: true }} animate={false} />
        ))}
      </FloatingWindow>
      {imageLine && imageOpen && (
        <FloatingWindow
          title={`${path} :: img`}
          t={t}
          onClose={() => setImageOpen(false)}
          className="floating-window--image"
          initialSize={IMG_SIZE}
          minSize={{ w: 260, h: 240 }}
          initialPos={companionPos()}
          ariaLabel={imageLine.alt ?? `${path} :: img`}
        >
          <OutputLine line={{ ...imageLine, instant: true }} animate={false} />
        </FloatingWindow>
      )}
    </>
  )
}
