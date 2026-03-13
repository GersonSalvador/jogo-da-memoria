import { useEffect, useRef, useState } from 'react'
import styles from './SaveScoreModal.module.scss'

type SaveScoreModalProps = {
  lastPlayerName: string
  score: number
  onSave: (playerName: string) => void
  onDismiss: () => void
}

export const SaveScoreModal = ({
  lastPlayerName,
  score,
  onSave,
  onDismiss,
}: SaveScoreModalProps) => {
  const [playerName, setPlayerName] = useState(lastPlayerName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = playerName.trim()
    if (!trimmed) return
    onSave(trimmed)
  }

  const isValid = playerName.trim().length > 0

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-score-title"
        className={styles.dialog}
      >
        <h2 id="save-score-title" className={styles.title}>
          Você venceu! 🎉
        </h2>
        <p className={styles.scoreDisplay}>
          Pontuação final: <strong>{score.toLocaleString('pt-BR')}</strong>
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="player-name" className={styles.label}>
            Seu nome
          </label>
          <input
            ref={inputRef}
            id="player-name"
            type="text"
            className={styles.input}
            value={playerName}
            maxLength={40}
            autoComplete="off"
            placeholder="Digite seu nome..."
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!isValid}
              aria-disabled={!isValid}
            >
              Salvar pontuação
            </button>
            <button type="button" className={styles.skipButton} onClick={onDismiss}>
              Pular
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
