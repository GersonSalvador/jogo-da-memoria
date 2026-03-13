import { GameBoard } from '../components/memory-game/GameBoard.tsx'
import { GameResult } from '../components/memory-game/GameResult.tsx'
import { GameSetup } from '../components/memory-game/GameSetup.tsx'
import { GameStatus } from '../components/memory-game/GameStatus.tsx'
import { useMemoryGame } from '../hooks/useMemoryGame.ts'
import styles from './MemoryGamePage.module.scss'

export const MemoryGamePage = () => {
  const {
    difficulty,
    theme,
    phase,
    errors,
    remainingSeconds,
    score,
    isResolving,
    boardRows,
    difficultyOptions,
    themes,
    setDifficulty,
    setTheme,
    startGame,
    handleCardClick,
    handlePlayAgain,
  } = useMemoryGame()

  return (
    <main className={styles.memoryGame}>
      <h1>Jogo da Memória</h1>

      {phase === 'setup' ? (
        <GameSetup
          difficulty={difficulty}
          difficultyOptions={difficultyOptions}
          theme={theme}
          themes={themes}
          onDifficultyChange={setDifficulty}
          onThemeChange={setTheme}
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
