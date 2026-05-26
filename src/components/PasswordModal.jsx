import { useEffect, useRef, useState } from 'react'

export default function PasswordModal({ filename, onSubmit, onCancel }) {
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
    <div
      className="modal-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Decrypt ${filename}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">DECRYPT // {filename}</div>
        <div className="modal__body">
          <span className="modal__label">enter key:</span>
          <input
            ref={inputRef}
            type="text"
            className="modal__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="decryption key"
          />
        </div>
        <div className="modal__footer">
          enter to submit · esc to cancel
        </div>
      </div>
    </div>
  )
}
