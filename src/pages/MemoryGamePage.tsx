import { useEffect, useRef } from 'react'
import { GameAnimation } from '../components/memory-game/GameAnimation.tsx'
import { GameBoard } from '../components/memory-game/GameBoard.tsx'
import { GameResult } from '../components/memory-game/GameResult.tsx'
import { GameSetup } from '../components/memory-game/GameSetup.tsx'
import { GameStatus } from '../components/memory-game/GameStatus.tsx'
import { LeaderboardPanel } from '../components/memory-game/LeaderboardPanel.tsx'
import { SaveScoreModal } from '../components/memory-game/SaveScoreModal.tsx'
import { useGameAudio } from '../hooks/useGameAudio.ts'
import { useLeaderboard } from '../hooks/useLeaderboard.ts'
import { useMemoryGame } from '../hooks/useMemoryGame.ts'
import { CARD_PATTERNS, type UiThemeKey } from '../services/gameConfig.ts'
import { CONFIGURABLE_SOUND_EVENTS, SOUND_EVENT_LABELS } from '../services/freesound.ts'
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
    startGame: startGameBase,
    handleCardClick: handleCardClickBase,
    handlePlayAgain: handlePlayAgainBase,
    abandonGame,
    closeSaveModal,
  } = useMemoryGame()

  const { topOverall, lastPlayerName, saveEntry, getTopForDifficulty } = useLeaderboard()
  const { isAudioEnabled, audioEventSettings, playSound, toggleAudio, toggleSoundEvent } =
    useGameAudio()

  const previousPhaseRef = useRef(phase)
  const previousIsResolvingRef = useRef(isResolving)
  const previousMatchedPairsRef = useRef(matchedPairs)
  const previousRemainingSecondsRef = useRef(remainingSeconds)
  const startGameTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (startGameTimeoutRef.current !== null) {
        window.clearTimeout(startGameTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const previousPhase = previousPhaseRef.current

    if (phase !== previousPhase) {
      if (phase === 'won') {
        playSound('gameWon')
      }

      if (phase === 'lost') {
        playSound('gameLost')
      }
    }

    previousPhaseRef.current = phase
  }, [phase, playSound])

  useEffect(() => {
    const previousIsResolving = previousIsResolvingRef.current
    if (previousIsResolving && !isResolving && phase === 'playing') {
      playSound('cardFlipDown')
    }

    previousIsResolvingRef.current = isResolving
  }, [isResolving, phase, playSound])

  useEffect(() => {
    const previousMatchedPairs = previousMatchedPairsRef.current
    if (matchedPairs > previousMatchedPairs && phase === 'playing') {
      playSound('pairMatched')
    }

    previousMatchedPairsRef.current = matchedPairs
  }, [matchedPairs, phase, playSound])

  useEffect(() => {
    const previousRemainingSeconds = previousRemainingSecondsRef.current
    if (
      phase === 'playing' &&
      remainingSeconds > 0 &&
      remainingSeconds <= 3 &&
      remainingSeconds !== previousRemainingSeconds
    ) {
      playSound('countdownTick')
    }

    previousRemainingSecondsRef.current = remainingSeconds
  }, [phase, remainingSeconds, playSound])

  const handleSaveScore = (playerName: string) => {
    saveEntry({ playerName, score, difficulty, matchedPairs, errors, remainingSeconds })
    closeSaveModal()
  }

  const handleStartGame = () => {
    if (!isAudioEnabled || !audioEventSettings.gameStart) {
      startGameBase()
      return
    }

    playSound('gameStart', { startAtSeconds: 0.72 })

    if (startGameTimeoutRef.current !== null) {
      window.clearTimeout(startGameTimeoutRef.current)
    }

    startGameTimeoutRef.current = window.setTimeout(() => {
      startGameBase()
      startGameTimeoutRef.current = null
    }, 720)
  }

  const handleCardClick = (cardId: string) => {
    const faceUpUnmatchedCount = boardRows
      .flat()
      .filter((card) => card.isFaceUp && !card.isMatched).length

    if (phase === 'playing' && !isResolving && faceUpUnmatchedCount === 0) {
      playSound('cardFlipUp')
    }

    handleCardClickBase(cardId)
  }

  const handlePlayAgain = () => {
    handlePlayAgainBase()
  }

  const handleAbandonGame = () => {
    abandonGame()
  }

  const handleCloseSaveModal = () => {
    closeSaveModal()
  }

  const handleThemeSelect = (themeKey: UiThemeKey) => {
    onSelectUiTheme(themeKey)
  }

  const handleCardPatternSelect = (patternOption: keyof typeof CARD_PATTERNS) => {
    setCardPattern(patternOption)
  }

  const handleDifficultySelect = (difficultyOption: typeof difficulty) => {
    setDifficulty(difficultyOption)
  }

  return (
    <main className={styles.memoryGame}>
      <GameAnimation phase={phase} />
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
                    onClick={() => handleThemeSelect(themeKey)}
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
                  onClick={() => handleCardPatternSelect(patternOption)}
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

          <p className={styles.menuTitle}>Sons</p>
          <button
            type="button"
            className={`${styles.themeOption} ${styles.audioToggle}`}
            role="menuitemcheckbox"
            aria-checked={isAudioEnabled}
            onClick={toggleAudio}
          >
            <input
              type="checkbox"
              className={styles.soundCheckbox}
              checked={isAudioEnabled}
              readOnly
              tabIndex={-1}
              aria-hidden="true"
            />
            <span>{isAudioEnabled ? 'Som ligado' : 'Som desligado'}</span>
          </button>
          <ul className={styles.menuList}>
            {CONFIGURABLE_SOUND_EVENTS.map((event) => (
              <li key={event}>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={isAudioEnabled ? audioEventSettings[event] : false}
                  disabled={!isAudioEnabled}
                  className={`${styles.themeOption} ${styles.soundOption}`}
                  onClick={() => toggleSoundEvent(event)}
                >
                  <input
                    type="checkbox"
                    className={styles.soundCheckbox}
                    checked={isAudioEnabled && audioEventSettings[event]}
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <span>{SOUND_EVENT_LABELS[event]}</span>
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
          onDifficultyChange={handleDifficultySelect}
          onStartGame={handleStartGame}
        />
      ) : (
        <div className={styles.playArea}>
          <GameStatus
            remainingSeconds={remainingSeconds}
            errors={errors}
            score={score}
            onAbandon={handleAbandonGame}
          />
          <GameBoard
            boardColumns={boardColumns}
            boardRows={boardRows}
            cardPattern={cardPattern}
            phase={phase}
            isResolving={isResolving}
            onCardClick={handleCardClick}
          />
          <GameResult phase={phase} score={score} onPlayAgain={handlePlayAgain} />
        </div>
      )}

      {showSaveModal && (
        <SaveScoreModal
          lastPlayerName={lastPlayerName}
          score={score}
          onSave={handleSaveScore}
          onDismiss={handleCloseSaveModal}
        />
      )}
    </main>
  )
}
