import { DIFFICULTIES, type DifficultyKey, type ThemeKey } from '../../services/gameConfig.ts'
import styles from './GameSetup.module.scss'

type GameSetupProps = {
  difficulty: DifficultyKey
  difficultyOptions: DifficultyKey[]
  theme: ThemeKey
  themes: readonly ThemeKey[]
  onDifficultyChange: (difficulty: DifficultyKey) => void
  onThemeChange: (theme: ThemeKey) => void
  onStartGame: () => void
}

export const GameSetup = ({
  difficulty,
  difficultyOptions,
  theme,
  themes,
  onDifficultyChange,
  onThemeChange,
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

      <label htmlFor="theme">Tema</label>
      <select
        id="theme"
        name="theme"
        value={theme}
        onChange={(event) => onThemeChange(event.target.value as ThemeKey)}
      >
        {themes.map((themeOption) => (
          <option key={themeOption} value={themeOption}>
            {themeOption}
          </option>
        ))}
      </select>

      <button type="button" onClick={onStartGame}>
        Iniciar partida
      </button>
    </section>
  )
}
