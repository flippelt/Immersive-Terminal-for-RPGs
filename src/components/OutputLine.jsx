import { useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter.js'
import CountdownLine from './CountdownLine.jsx'

const CLASS_BY_TYPE = {
  err: 'line line--err',
  ok: 'line line--ok',
  muted: 'line line--muted',
  user: 'line line--user',
  banner: 'banner',
  normal: 'line'
}

function TextLine({ line, animate, speed, onDone }) {
  const cls = CLASS_BY_TYPE[line.type] ?? CLASS_BY_TYPE.normal
  const text = line.text ?? ''
  const enabled = animate && !line.instant && line.type !== 'banner'
  const { out } = useTypewriter(text, { speed, enabled, onDone })
  const display = enabled ? out : text

  if (line.type === 'banner') {
    return <pre className={cls}>{display}</pre>
  }
  return <p className={cls}>{display || ' '}</p>
}

// A CRT-filtered picture (Esper photo, map, mugshot). `src` is a URL or
// data URI from a file's `image:` front-matter. The queue advances once the
// image loads (or fails), so it never blocks the typewriter.
function ImageLine({ line, animate, onDone }) {
  const [failed, setFailed] = useState(false)
  const done = () => animate && onDone?.()
  if (failed) {
    return <p className="line line--muted">[image unavailable: {line.src}]</p>
  }
  return (
    <span className="crt-img__wrap">
      <img
        className="crt-img"
        src={line.src}
        alt={line.alt ?? ''}
        onLoad={done}
        onError={() => {
          setFailed(true)
          done()
        }}
      />
    </span>
  )
}

export default function OutputLine({ line, animate, speed, onDone }) {
  // 'progress' lines are rendered as a centered popup by Terminal, not
  // inline — so they produce no inline output here.
  if (line.type === 'progress') return null
  if (line.type === 'countdown') {
    return <CountdownLine line={line} animate={animate} onDone={onDone} />
  }
  if (line.type === 'image') {
    return <ImageLine line={line} animate={animate} onDone={onDone} />
  }
  return <TextLine line={line} animate={animate} speed={speed} onDone={onDone} />
}
