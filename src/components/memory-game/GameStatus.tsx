import styles from './GameStatus.module.scss'

type GameStatusProps = {
  remainingSeconds: number
  errors: number
  score: number
}

export const GameStatus = ({ remainingSeconds, errors, score }: GameStatusProps) => {
  return (
    <section className={styles.scoreboard} aria-label="Placar da partida">
      <p>Tempo restante: {remainingSeconds}</p>
      <p>Erros: {errors}</p>
      <p>Pontuação: {score}</p>
    </section>
  )
}
