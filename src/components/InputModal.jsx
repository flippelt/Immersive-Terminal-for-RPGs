import { useEffect, useRef, useState } from 'react'
import { makeT } from '../i18n/ui.js'

// Generic CRT dialog: a titled, labeled input. Used by both the decrypt
// password prompt and the crack roll-check prompt.
export default function InputModal({
  title,
  label,
  inputType = 'text',
  hint,
  t = makeT('en'),
  onSubmit,
  onCancel
}) {
  const hintText = hint ?? t('modal.input.hint')
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit(value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">{title}</div>
        <div className="modal__body">
          <span className="modal__label">{label}</span>
          <input
            ref={inputRef}
            type={inputType}
            inputMode={inputType === 'number' ? 'numeric' : undefined}
            className="modal__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={label}
          />
        </div>
        <div className="modal__footer">{hintText}</div>
      </div>
    </div>
  )
}
