import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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
  dealSequence: number
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
  dealSequence,
  onCardClick,
}: GameBoardProps) => {
  const totalCards = boardRows.length * boardColumns
  const boardMaxWidth = calculateBoardMaxWidth(totalCards, boardColumns)
  const layoutSignature = boardRows
    .map((row) => row.map((card) => card.id).join(','))
    .join('|')
  const orderedCardIds = useMemo(() => {
    return boardRows.flat().map((card) => card.id)
  }, [layoutSignature])
  const boardRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [cardOffsets, setCardOffsets] = useState<Record<string, { x: number; y: number }>>({})
  const [isDealing, setIsDealing] = useState(false)

  useEffect(() => {
    if (phase !== 'playing') {
      setIsDealing(false)
      setCardOffsets({})
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsDealing(false)
      setCardOffsets({})
      return
    }

    const rafId = window.requestAnimationFrame(() => {
      const boardElement = boardRef.current
      if (!boardElement) {
        return
      }

      const boardRect = boardElement.getBoundingClientRect()
      const boardCenterX = boardRect.left + boardRect.width / 2
      const boardCenterY = boardRect.top + boardRect.height / 2
      const nextOffsets: Record<string, { x: number; y: number }> = {}

      for (const cardId of orderedCardIds) {
        const cardElement = cardRefs.current[cardId]
        if (!cardElement) {
          continue
        }

        const cardRect = cardElement.getBoundingClientRect()
        const cardCenterX = cardRect.left + cardRect.width / 2
        const cardCenterY = cardRect.top + cardRect.height / 2

        nextOffsets[cardId] = {
          x: boardCenterX - cardCenterX,
          y: boardCenterY - cardCenterY,
        }
      }

      setCardOffsets(nextOffsets)
      setIsDealing(true)
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [dealSequence, orderedCardIds, phase])

  return (
    <section
      ref={boardRef}
      className={styles.board}
      aria-label="Tabuleiro de cartas"
      style={{ '--board-max-width': `${boardMaxWidth}px` } as CSSProperties}
    >
      {boardRows.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={styles.row}
          style={
            {
              gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))`,
              '--deal-row-index': rowIndex,
            } as CSSProperties
          }
        >
          {row.map((card, columnIndex) => (
            <div
              key={card.id}
              ref={(element) => {
                cardRefs.current[card.id] = element
              }}
              className={isDealing ? styles.dealCard : undefined}
              style={
                {
                  '--deal-from-x': `${cardOffsets[card.id]?.x ?? 0}px`,
                  '--deal-from-y': `${cardOffsets[card.id]?.y ?? 0}px`,
                  '--deal-col-index': columnIndex,
                } as CSSProperties
              }
            >
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
