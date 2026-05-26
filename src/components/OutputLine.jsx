import { useTypewriter } from '../hooks/useTypewriter.js'
import ProgressLine from './ProgressLine.jsx'
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

export default function OutputLine({ line, animate, speed, onDone }) {
  if (line.type === 'progress') {
    return <ProgressLine line={line} animate={animate} onDone={onDone} />
  }
  if (line.type === 'countdown') {
    return <CountdownLine line={line} animate={animate} onDone={onDone} />
  }
  return <TextLine line={line} animate={animate} speed={speed} onDone={onDone} />
}
