import type { GamePhase } from '../../hooks/useMemoryGame.ts'
import type { MemoryCard } from '../../services/memoryDeck.ts'
import styles from './GameBoard.module.scss'

type GameBoardProps = {
  boardRows: MemoryCard[][]
  phase: GamePhase
  isResolving: boolean
  onCardClick: (cardId: string) => void
}

export const GameBoard = ({ boardRows, phase, isResolving, onCardClick }: GameBoardProps) => {
  return (
    <table className={styles.board} role="grid" aria-label="Tabuleiro de cartas">
      <tbody>
        {boardRows.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((card) => (
              <td key={card.id}>
                <button
                  type="button"
                  className={styles.card}
                  aria-label="Carta"
                  onClick={() => onCardClick(card.id)}
                  disabled={phase !== 'playing' || card.isMatched || card.isFaceUp || isResolving}
                >
                  {card.isFaceUp || card.isMatched ? (
                    <img src={card.face} alt={`Face ${card.pairId + 1}`} loading="lazy" />
                  ) : (
                    <span className={styles.cardBack}>?</span>
                  )}
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
