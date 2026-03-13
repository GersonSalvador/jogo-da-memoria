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
      <label htmlFor="difficulty">Dificuldade</label>
      <select
        id="difficulty"
        name="difficulty"
        value={difficulty}
        onChange={(event) => onDifficultyChange(event.target.value as DifficultyKey)}
      >
        {difficultyOptions.map((difficultyOption) => (
          <option key={difficultyOption} value={difficultyOption}>
            {DIFFICULTIES[difficultyOption].label}
          </option>
        ))}
      </select>

      <button type="button" onClick={onStartGame}>
        Iniciar partida
      </button>
    </section>
  )
}
