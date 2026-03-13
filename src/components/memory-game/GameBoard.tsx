import type { CSSProperties } from 'react'
import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import type { CardPatternKey } from '../../services/gameConfig.ts'
import type { MemoryCard } from '../../services/memoryDeck.ts'
import { MemoryCard as GameCard } from './MemoryCard.tsx'
import styles from './GameBoard.module.scss'

type GameBoardProps = {
  boardColumns: number
  boardRows: MemoryCard[][]
  cardPattern: CardPatternKey
  phase: GamePhase
  isResolving: boolean
  onCardClick: (cardId: string) => void
}

const calculateBoardMaxWidth = (totalCards: number, columns: number): number => {
  if (totalCards <= 16) {
    return 560
  }

  if (totalCards <= 36) {
    return 760
  }

  if (columns >= 8 || totalCards >= 64) {
    return 1040
  }

  return 920
}

export const GameBoard = ({
  boardColumns,
  boardRows,
  cardPattern,
  phase,
  isResolving,
  onCardClick,
}: GameBoardProps) => {
  const totalCards = boardRows.length * boardColumns
  const boardMaxWidth = calculateBoardMaxWidth(totalCards, boardColumns)

  return (
    <section
      className={styles.board}
      aria-label="Tabuleiro de cartas"
      style={{ '--board-max-width': `${boardMaxWidth}px` } as CSSProperties}
    >
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
                cardPattern={cardPattern}
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
