import { useEffect, useState } from 'react'
import { setMuted } from '../audio/sfx.js'
import { makeT } from '../i18n/ui.js'

const LS_KEY = 'tirpg.muted'

export default function AudioToggle({ t = makeT('en') }) {
  const [muted, setLocalMuted] = useState(
    () => localStorage.getItem(LS_KEY) === 'true'
  )

  useEffect(() => {
    setMuted(muted)
    localStorage.setItem(LS_KEY, String(muted))
  }, [muted])

  return (
    <button
      className="audio-toggle"
      onClick={() => setLocalMuted((m) => !m)}
      title={muted ? t('audio.off.title') : t('audio.on.title')}
      aria-label={muted ? 'unmute audio' : 'mute audio'}
    >
      {muted ? t('audio.off') : t('audio.on')}
    </button>
  )
}
