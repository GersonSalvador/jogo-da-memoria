import { describe, expect, it, vi } from 'vitest'
import { createDeck } from './memoryDeck'

describe('memoryDeck', () => {
  it('deve embaralhar as cartas ao criar um novo deck', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    randomSpy.mockImplementation(() => 0)

    const deck = createDeck({ totalCards: 8 })

    expect(deck).toHaveLength(8)
    expect(deck.map((card) => card.id)).toEqual([
      '0-b',
      '1-a',
      '1-b',
      '2-a',
      '2-b',
      '3-a',
      '3-b',
      '0-a',
    ])

    randomSpy.mockRestore()
  })

  it('deve manter pares válidos após embaralhar', () => {
    const deck = createDeck({ totalCards: 12 })

    const pairCountMap = new Map<number, number>()

    for (const card of deck) {
      pairCountMap.set(card.pairId, (pairCountMap.get(card.pairId) ?? 0) + 1)
      expect(card.isFaceUp).toBe(false)
      expect(card.isMatched).toBe(false)
    }

    expect(pairCountMap.size).toBe(6)
    for (const totalByPair of pairCountMap.values()) {
      expect(totalByPair).toBe(2)
    }
  })
})
