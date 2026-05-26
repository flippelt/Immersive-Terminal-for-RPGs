// Minimal markdown → terminal lines renderer. Line-level only (the
// typewriter animates plain strings, so there's no rich inline styling),
// but enough for cinematic structure:
//
//   # / ##         heading  -> accent, uppercased
//   ### ..         heading  -> accent
//   ---/***/___    rule     -> divider line
//   > quote        -> muted, ▌-barred
//   - / * / +      list     -> • bullet
//   **bold**       -> UPPERCASED inline (emphasis without spans)
//   *italic* `code`-> markers stripped

const RULE_WIDTH = 48

function inline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, (_, t) => t.toUpperCase())
    .replace(/__(.+?)__/g, (_, t) => t.toUpperCase())
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
}

export function renderMarkdown(content) {
  return String(content)
    .split('\n')
    .map((line) => {
      if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
        return { text: '─'.repeat(RULE_WIDTH), type: 'muted' }
      }
      const h = line.match(/^(#{1,6})\s+(.*)$/)
      if (h) {
        const text = inline(h[2])
        return { text: h[1].length <= 2 ? text.toUpperCase() : text, type: 'ok' }
      }
      const q = line.match(/^>\s?(.*)$/)
      if (q) return { text: '▌ ' + inline(q[1]), type: 'muted' }
      const li = line.match(/^(\s*)[-*+]\s+(.*)$/)
      if (li) return { text: `${li[1]}• ${inline(li[2])}` }
      return { text: inline(line) }
    })
}
