import { DIFFICULTIES, type DifficultyKey } from '../../services/gameConfig.ts'
import styles from './GameSetup.module.scss'

type GameSetupProps = {
  difficulty: DifficultyKey
  difficultyOptions: DifficultyKey[]
  onDifficultyChange: (difficulty: DifficultyKey) => void
  onStartGame: () => void
}

export const GameSetup = ({
  difficulty,
  difficultyOptions,
  onDifficultyChange,
  onStartGame,
}: GameSetupProps) => {
  return (
    <section className={styles.setupPanel} aria-label="Configuração da partida">
      <fieldset className={styles.difficultyGroup}>
        <legend>Dificuldade</legend>
        {difficultyOptions.map((difficultyOption) => (
          <button
            key={difficultyOption}
            type="button"
            className={styles.difficultyButton}
            aria-pressed={difficulty === difficultyOption}
            onClick={() => onDifficultyChange(difficultyOption)}
          >
            {DIFFICULTIES[difficultyOption].label}
          </button>
        ))}
      </fieldset>

      <button type="button" onClick={onStartGame}>
        Iniciar partida
      </button>
    </section>
  )
}
