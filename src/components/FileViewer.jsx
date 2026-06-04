import OutputLine from './OutputLine.jsx'
import { renderFileContent } from 'rpgterm-engine'
import { makeT } from '../i18n/ui.js'
import FloatingWindow from './FloatingWindow.jsx'

// Cinematic file reader: `cat` (and the unlocked-file reveals after `crack`,
// `unlock` and `decrypt`) open a file here instead of dumping it inline.
// It uses the shared FloatingWindow chrome, so on desktop it's a draggable,
// resizable, non-modal window (the player can keep typing behind it) and on
// mobile it becomes a centered modal. Content (text, markdown, CRT-filtered
// images) is rendered via the shared renderFileContent so it matches the
// inline look. Close with the × button or Esc.
export default function FileViewer({ path, node, t = makeT('en'), onClose }) {
  const lines = renderFileContent(path, node)

  return (
    <FloatingWindow
      title={path}
      t={t}
      onClose={onClose}
      className="floating-window--file"
      initialSize={{ w: 640, h: 480 }}
      minSize={{ w: 340, h: 220 }}
      anchor="center"
      footer={t('viewer.hint')}
    >
      {lines.map((line, i) => (
        <OutputLine key={i} line={{ ...line, instant: true }} animate={false} />
      ))}
    </FloatingWindow>
  )
}
