import { GameBoard } from '../components/memory-game/GameBoard.tsx'
import { GameResult } from '../components/memory-game/GameResult.tsx'
import { GameSetup } from '../components/memory-game/GameSetup.tsx'
import { GameStatus } from '../components/memory-game/GameStatus.tsx'
import { LeaderboardPanel } from '../components/memory-game/LeaderboardPanel.tsx'
import { SaveScoreModal } from '../components/memory-game/SaveScoreModal.tsx'
import { useLeaderboard } from '../hooks/useLeaderboard.ts'
import { useMemoryGame } from '../hooks/useMemoryGame.ts'
import { CARD_PATTERNS, type UiThemeKey } from '../services/gameConfig.ts'
import styles from './MemoryGamePage.module.scss'

type MemoryGamePageProps = {
  uiTheme: UiThemeKey
  uiThemes: Record<UiThemeKey, { label: string; icon: string }>
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
          <rect
            x="5"
            y="4"
            width="14"
            height="16"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 8h8M8 11h8M8 14h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'oceano':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'claro':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}

export const MemoryGamePage = ({ uiTheme, uiThemes, onSelectUiTheme }: MemoryGamePageProps) => {
  const {
    difficulty,
    cardPattern,
    phase,
    errors,
    matchedPairs,
    remainingSeconds,
    score,
    isResolving,
    showSaveModal,
    boardColumns,
    boardRows,
    difficultyOptions,
    cardPatternOptions,
    setDifficulty,
    setCardPattern,
    startGame,
    handleCardClick,
    handlePlayAgain,
    closeSaveModal,
  } = useMemoryGame()

  const { topOverall, lastPlayerName, saveEntry, getTopForDifficulty } = useLeaderboard()

  const handleSaveScore = (playerName: string) => {
    saveEntry({ playerName, score, difficulty, matchedPairs, errors, remainingSeconds })
    closeSaveModal()
  }

  return (
    <main className={styles.memoryGame}>
      <div className={styles.themeSwitcher}>
        <button
          type="button"
          className={styles.themeToggle}
          aria-haspopup="menu"
          aria-label="Abrir configuracoes do jogador"
          title="Configuracoes do jogador"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M19.4 13a7.8 7.8 0 000-2l2-1.5-2-3.4-2.4 1a7.7 7.7 0 00-1.7-1L15 3h-6l-.3 3.1a7.7 7.7 0 00-1.7 1l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 000 2l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 001.7 1L9 21h6l.3-3.1a7.7 7.7 0 001.7-1l2.4 1 2-3.4-2-1.5zM12 15.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div className={styles.themeMenu} role="menu" aria-label="Configuracoes do jogador">
          <p className={styles.menuTitle}>Tema visual</p>
          <ul className={styles.menuList}>
            {(Object.entries(uiThemes) as [UiThemeKey, { label: string; icon: string }][]).map(
              ([themeKey, { label }]) => (
                <li key={themeKey}>
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

          <p className={styles.menuTitle}>Verso da carta</p>
          <ul className={styles.menuList}>
            {cardPatternOptions.map((patternOption) => (
              <li key={patternOption}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={cardPattern === patternOption}
                  className={`${styles.themeOption} ${cardPattern === patternOption ? styles.themeOptionActive : ''}`}
                  onClick={() => setCardPattern(patternOption)}
                >
                  <span
                    className={styles.patternSwatch}
                    data-card-pattern={patternOption}
                    aria-hidden="true"
                  />
                  <span>{CARD_PATTERNS[patternOption].label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <h1>Jogo da Memória</h1>

      {phase !== 'playing' && (
        <LeaderboardPanel topOverall={topOverall} getTopForDifficulty={getTopForDifficulty} />
      )}

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
            boardColumns={boardColumns}
            boardRows={boardRows}
            cardPattern={cardPattern}
            phase={phase}
            isResolving={isResolving}
            onCardClick={handleCardClick}
          />
          <GameResult phase={phase} score={score} onPlayAgain={handlePlayAgain} />
        </>
      )}

      {showSaveModal && (
        <SaveScoreModal
          lastPlayerName={lastPlayerName}
          score={score}
          onSave={handleSaveScore}
          onDismiss={closeSaveModal}
        />
      )}
    </main>
  )
}
