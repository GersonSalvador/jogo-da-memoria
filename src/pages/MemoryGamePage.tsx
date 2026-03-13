import { GameBoard } from '../components/memory-game/GameBoard.tsx'
import { GameResult } from '../components/memory-game/GameResult.tsx'
import { GameSetup } from '../components/memory-game/GameSetup.tsx'
import { GameStatus } from '../components/memory-game/GameStatus.tsx'
import { useMemoryGame } from '../hooks/useMemoryGame.ts'
import { type UiThemeKey } from '../services/gameConfig.ts'
import styles from './MemoryGamePage.module.scss'

type MemoryGamePageProps = {
  uiTheme: UiThemeKey
  uiThemes: Record<UiThemeKey, { label: string; icon: string }>
  currentThemeLabel: string
  nextTheme: UiThemeKey
  nextThemeLabel: string
  onCycleUiTheme: () => void
  onSelectUiTheme: (theme: UiThemeKey) => void
}

const ThemeIcon = ({ theme }: { theme: UiThemeKey }) => {
  switch (theme) {
    case 'escuro':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 15.5A8.5 8.5 0 118.5 4a7 7 0 1011.5 11.5z" fill="currentColor" />
        </svg>
      )
    case 'sepia':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 8h8M8 11h8M8 14h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'oceano':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'claro':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
  }
}

export const MemoryGamePage = ({
  uiTheme,
  uiThemes,
  currentThemeLabel,
  nextTheme,
  nextThemeLabel,
  onCycleUiTheme,
  onSelectUiTheme,
}: MemoryGamePageProps) => {
  const {
    difficulty,
    phase,
    errors,
    remainingSeconds,
    score,
    isResolving,
    boardRows,
    difficultyOptions,
    setDifficulty,
    startGame,
    handleCardClick,
    handlePlayAgain,
  } = useMemoryGame()

  return (
    <main className={styles.memoryGame}>
      <div className={styles.themeSwitcher}>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={onCycleUiTheme}
          aria-haspopup="menu"
          aria-label={`Alternar tema. Proximo: ${nextThemeLabel}`}
          title={`Tema atual: ${currentThemeLabel}. Proximo: ${nextThemeLabel}`}
        >
          <ThemeIcon theme={uiTheme} />
        </button>
        <ul className={styles.themeMenu} role="menu" aria-label="Temas visuais">
          {(Object.entries(uiThemes) as [UiThemeKey, { label: string; icon: string }][]).map(
            ([themeKey, { label }]) => (
              <li key={themeKey} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={uiTheme === themeKey}
                  className={`${styles.themeOption} ${uiTheme === themeKey ? styles.themeOptionActive : ''}`}
                  onClick={() => onSelectUiTheme(themeKey)}
                >
                  <ThemeIcon theme={themeKey} />
                  <span>{label}</span>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
      <h1>Jogo da Memória</h1>

      {phase === 'setup' ? (
        <GameSetup
          difficulty={difficulty}
          difficultyOptions={difficultyOptions}
          onDifficultyChange={setDifficulty}
          onStartGame={startGame}
        />
      ) : (
        <>
          <GameStatus remainingSeconds={remainingSeconds} errors={errors} score={score} />
          <GameBoard
            boardRows={boardRows}
            phase={phase}
            isResolving={isResolving}
            onCardClick={handleCardClick}
          />
          <GameResult phase={phase} score={score} onPlayAgain={handlePlayAgain} />
        </>
      )}
    </main>
  )
}
