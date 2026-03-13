import type { CardPatternKey } from '../../services/gameConfig.ts'
import type { MemoryCard as MemoryCardType } from '../../services/memoryDeck.ts'
import styles from './MemoryCard.module.scss'

type MemoryCardProps = {
  card: MemoryCardType
  cardPattern: CardPatternKey
  isDisabled: boolean
  onClick: (cardId: string) => void
}

export const MemoryCard = ({ card, cardPattern, isDisabled, onClick }: MemoryCardProps) => {
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
        <div
          className={`${styles.cardFace} ${styles.cardBack}`}
          data-card-pattern={cardPattern}
          aria-hidden={isFlipped}
        >
          {cardPattern === 'classico' && (
            <svg
              viewBox="0 0 100 100"
              aria-hidden="true"
              className={styles.classicSvg}
              style={{ color: 'var(--text-h)' }}
            >
              <rect
                x="3.5"
                y="3.5"
                width="93"
                height="93"
                rx="5"
                ry="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.55"
              />
              <rect
                x="9"
                y="9"
                width="82"
                height="82"
                rx="2"
                ry="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <circle
                cx="50"
                cy="50"
                r="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="1.5 3"
                opacity="0.35"
              />
              <polygon
                points="50,28 53.8,40.8 65.6,34.4 59.2,46.2 72,50 59.2,53.8 65.6,65.6 53.8,59.2 50,72 46.2,59.2 34.4,65.6 40.8,53.8 28,50 40.8,46.2 34.4,34.4 46.2,40.8"
                fill="currentColor"
                opacity="0.28"
              />
              <polygon points="50,22 47,14 53,14" fill="currentColor" opacity="0.32" />
              <polygon points="50,78 47,86 53,86" fill="currentColor" opacity="0.32" />
              <polygon points="78,50 86,47 86,53" fill="currentColor" opacity="0.32" />
              <polygon points="22,50 14,47 14,53" fill="currentColor" opacity="0.32" />
              <circle cx="14" cy="10.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="17.5" cy="14" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="14" cy="17.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="10.5" cy="14" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="86" cy="10.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="89.5" cy="14" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="86" cy="17.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="82.5" cy="14" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="86" cy="14" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="14" cy="82.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="17.5" cy="86" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="14" cy="89.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="10.5" cy="86" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="14" cy="86" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="86" cy="82.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="89.5" cy="86" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="86" cy="89.5" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="82.5" cy="86" r="3.5" fill="currentColor" opacity="0.18" />
              <circle cx="86" cy="86" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.6" />
              <circle
                cx="50"
                cy="50"
                r="3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.35"
              />
            </svg>
          )}
        </div>
        <div className={`${styles.cardFace} ${styles.cardFront}`} aria-hidden={!isFlipped}>
          <img src={card.face} alt={`Face ${card.pairId + 1}`} />
        </div>
      </div>
    </button>
  )
}
