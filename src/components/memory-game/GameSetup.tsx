import { DIFFICULTIES, type COLOR_THEMES, type ColorThemeKey, type DifficultyKey } from '../../services/gameConfig.ts'
import styles from './GameSetup.module.scss'

type GameSetupProps = {
  difficulty: DifficultyKey
  difficultyOptions: DifficultyKey[]
  colorTheme: ColorThemeKey
  colorThemes: typeof COLOR_THEMES
  onDifficultyChange: (difficulty: DifficultyKey) => void
  onColorThemeChange: (colorTheme: ColorThemeKey) => void
  onStartGame: () => void
}

export const GameSetup = ({
  difficulty,
  difficultyOptions,
  colorTheme,
  colorThemes,
  onDifficultyChange,
  onColorThemeChange,
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

      <fieldset className={styles.colorThemeFieldset}>
        <legend>Tema de cores</legend>
        <div className={styles.colorSwatches} role="radiogroup" aria-label="Tema de cores">
          {(
            Object.entries(colorThemes) as [ColorThemeKey, { label: string; accent: string }][]
          ).map(([key, { label, accent }]) => (
            <label
              key={key}
              className={`${styles.swatchLabel} ${colorTheme === key ? styles.swatchLabelActive : ''}`}
              title={label}
            >
              <input
                type="radio"
                name="colorTheme"
                value={key}
                checked={colorTheme === key}
                onChange={() => onColorThemeChange(key)}
                className={styles.swatchInput}
              />
              <span
                className={styles.swatch}
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <span className={styles.swatchName}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" onClick={onStartGame}>
        Iniciar partida
      </button>
    </section>
  )
}
