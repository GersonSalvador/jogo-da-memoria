import type { MemoryCard as MemoryCardType } from '../../services/memoryDeck.ts'
import styles from './MemoryCard.module.scss'

type MemoryCardProps = {
  card: MemoryCardType
  isDisabled: boolean
  onClick: (cardId: string) => void
}

export const MemoryCard = ({ card, isDisabled, onClick }: MemoryCardProps) => {
  const isFlipped = card.isFaceUp || card.isMatched

  return (
    <button
      type="button"
      className={styles.card}
      aria-label="Carta"
      onClick={() => onClick(card.id)}
      disabled={isDisabled}
      data-flipped={isFlipped}
    >
      <div className={styles.cardInner}>
        <div className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden={isFlipped}>
          MEMO
        </div>
        <div className={`${styles.cardFace} ${styles.cardFront}`} aria-hidden={!isFlipped}>
          <img src={card.face} alt={`Face ${card.pairId + 1}`} />
        </div>
      </div>
    </button>
  )
}
