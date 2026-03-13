import type { ThemeKey } from './gameConfig'
import { generateFace } from './dicebear'

export type MemoryCard = {
  id: string
  pairId: number
  face: string
  isFaceUp: boolean
  isMatched: boolean
}

type CreateDeckInput = {
  totalCards: number
  theme: ThemeKey
}

export const createDeck = ({ totalCards, theme }: CreateDeckInput): MemoryCard[] => {
  const totalPairs = totalCards / 2
  const deck: MemoryCard[] = []

  for (let pairId = 0; pairId < totalPairs; pairId += 1) {
    const face = generateFace({
      seed: `${theme}-${pairId}`,
      theme,
    })

    deck.push({
      id: `${pairId}-a`,
      pairId,
      face,
      isFaceUp: false,
      isMatched: false,
    })

    deck.push({
      id: `${pairId}-b`,
      pairId,
      face,
      isFaceUp: false,
      isMatched: false,
    })
  }

  return deck
}
