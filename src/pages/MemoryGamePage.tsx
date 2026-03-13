import { GameBoard } from '../components/memory-game/GameBoard.tsx'
import { GameResult } from '../components/memory-game/GameResult.tsx'
import { GameSetup } from '../components/memory-game/GameSetup.tsx'
import { GameStatus } from '../components/memory-game/GameStatus.tsx'
import { useMemoryGame } from '../hooks/useMemoryGame.ts'
import styles from './MemoryGamePage.module.scss'

export const MemoryGamePage = () => {
  const {
    difficulty,
    colorTheme,
    phase,
    errors,
    remainingSeconds,
    score,
    isResolving,
    boardRows,
    difficultyOptions,
    colorThemes,
    setDifficulty,
    setColorTheme,
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
          colorTheme={colorTheme}
          colorThemes={colorThemes}
          onDifficultyChange={setDifficulty}
          onColorThemeChange={setColorTheme}
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
