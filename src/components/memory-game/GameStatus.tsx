import styles from './GameStatus.module.scss'

type GameStatusProps = {
  remainingSeconds: number
  errors: number
  score: number
  onAbandon: () => void
}

export const GameStatus = ({ remainingSeconds, errors, score, onAbandon }: GameStatusProps) => {
  return (
    <section className={styles.scoreboard} aria-label="Placar da partida">
      <p>Tempo restante: {remainingSeconds}</p>
      <p>Erros: {errors}</p>
      <p>Pontuação: {score}</p>
      <button
        type="button"
        className={styles.abandonButton}
        onClick={onAbandon}
        aria-label="Abandonar partida"
        title="Abandonar partida"
      >
        Fechar
      </button>
    </section>
  )
}
