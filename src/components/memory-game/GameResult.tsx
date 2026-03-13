import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import styles from './GameResult.module.scss'

type GameResultProps = {
  phase: GamePhase
  score: number
  onPlayAgain: () => void
}

export const GameResult = ({ phase, score, onPlayAgain }: GameResultProps) => {
  if (phase !== 'won' && phase !== 'lost') {
    return null
  }

  const phaseClassName = phase === 'won' ? styles.resultWon : styles.resultLost

  return (
    <section className={`${styles.resultPanel} ${phaseClassName}`} aria-live="assertive">
      <h2>{phase === 'won' ? 'Você venceu' : 'Tempo esgotado'}</h2>
      <p>Pontuação final: {score}</p>
      <button type="button" onClick={onPlayAgain}>
        Jogar novamente
      </button>
    </section>
  )
}
