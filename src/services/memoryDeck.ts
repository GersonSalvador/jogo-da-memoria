import { CARD_THEME } from './gameConfig'
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
}

const shuffleDeck = (cards: MemoryCard[]): MemoryCard[] => {
  const shuffledCards = [...cards]

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentCard = shuffledCards[index]

    shuffledCards[index] = shuffledCards[randomIndex]!
    shuffledCards[randomIndex] = currentCard!
  }

  return shuffledCards
}

export const createDeck = ({ totalCards }: CreateDeckInput): MemoryCard[] => {
  const totalPairs = totalCards / 2
  const deck: MemoryCard[] = []

  for (let pairId = 0; pairId < totalPairs; pairId += 1) {
    const face = generateFace({
      seed: `${CARD_THEME}-${pairId}`,
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

  return shuffleDeck(deck)
}
