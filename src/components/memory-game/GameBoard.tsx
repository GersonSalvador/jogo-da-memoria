import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import type { MemoryCard } from '../../services/memoryDeck.ts'
import { MemoryCard as GameCard } from './MemoryCard.tsx'
import styles from './GameBoard.module.scss'

type GameBoardProps = {
  boardRows: MemoryCard[][]
  phase: GamePhase
  isResolving: boolean
  onCardClick: (cardId: string) => void
}

export const GameBoard = ({ boardRows, phase, isResolving, onCardClick }: GameBoardProps) => {
  return (
    <section className={styles.board} role="grid" aria-label="Tabuleiro de cartas">
      {boardRows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} role="row" className={styles.row}>
          {row.map((card) => (
            <div key={card.id} role="gridcell">
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
