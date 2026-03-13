import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import type { MemoryCard } from '../../services/memoryDeck.ts'
import { MemoryCard as GameCard } from './MemoryCard.tsx'
import styles from './GameBoard.module.scss'

type GameBoardProps = {
  boardColumns: number
  boardRows: MemoryCard[][]
  phase: GamePhase
  isResolving: boolean
  onCardClick: (cardId: string) => void
}

export const GameBoard = ({
  boardColumns,
  boardRows,
  phase,
  isResolving,
  onCardClick,
}: GameBoardProps) => {
  return (
    <section className={styles.board} aria-label="Tabuleiro de cartas">
      {boardRows.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={styles.row}
          style={{ gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))` }}
        >
          {row.map((card) => (
            <div key={card.id}>
              <GameCard
                card={card}
                isDisabled={phase !== 'playing' || card.isMatched || card.isFaceUp || isResolving}
                onClick={onCardClick}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
