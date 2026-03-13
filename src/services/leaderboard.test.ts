import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  addLeaderboardEntry,
  getLastPlayerName,
  getTopByDifficulty,
  getTopOverall,
  loadLeaderboardData,
  sortByScore,
} from './leaderboard.ts'
import type { LeaderboardEntry } from '../types/leaderboard.ts'
import { TOP_N } from '../types/leaderboard.ts'

const makeEntry = (
  overrides: Partial<Omit<LeaderboardEntry, 'id'>> = {},
): Omit<LeaderboardEntry, 'id'> => ({
  playerName: 'Jogador',
  score: 100,
  difficulty: 'facil',
  matchedPairs: 4,
  errors: 0,
  remainingSeconds: 60,
  timestamp: Date.now(),
  ...overrides,
})

describe('leaderboard service', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  describe('loadLeaderboardData', () => {
    it('deve retornar dados vazios se localStorage estiver limpo', () => {
      const data = loadLeaderboardData()
      expect(data.entries).toHaveLength(0)
      expect(data.lastPlayerName).toBe('')
    })

    it('deve retornar dados vazios se localStorage contiver JSON inválido', () => {
      window.localStorage.setItem('memory-game.leaderboard', 'nao-e-json{]')
      const data = loadLeaderboardData()
      expect(data.entries).toHaveLength(0)
    })

    it('deve retornar dados vazios se JSON não possuir campo entries', () => {
      window.localStorage.setItem('memory-game.leaderboard', JSON.stringify({ foo: 'bar' }))
      const data = loadLeaderboardData()
      expect(data.entries).toHaveLength(0)
    })
  })

  describe('sortByScore', () => {
    it('deve ordenar entradas por score decrescente', () => {
      const entries = [
        { ...makeEntry({ score: 300 }), id: '1' },
        { ...makeEntry({ score: 100 }), id: '2' },
        { ...makeEntry({ score: 200 }), id: '3' },
      ]
      const sorted = sortByScore(entries)
      expect(sorted.map((e) => e.score)).toEqual([300, 200, 100])
    })

    it('deve usar timestamp mais recente como critério de desempate', () => {
      const entries = [
        { ...makeEntry({ score: 100, timestamp: 1000 }), id: '1' },
        { ...makeEntry({ score: 100, timestamp: 2000 }), id: '2' },
      ]
      const sorted = sortByScore(entries)
      expect(sorted[0]?.id).toBe('2')
    })

    it('não deve mutar o array original', () => {
      const entries = [
        { ...makeEntry({ score: 200 }), id: '1' },
        { ...makeEntry({ score: 100 }), id: '2' },
      ]
      const original = [...entries]
      sortByScore(entries)
      expect(entries[0]?.id).toBe(original[0]?.id)
    })
  })

  describe('addLeaderboardEntry', () => {
    it('deve adicionar entrada e retornar dados atualizados', () => {
      const entry = makeEntry({ playerName: 'Alice', score: 500 })
      const result = addLeaderboardEntry(entry)
      expect(result.entries).toHaveLength(1)
      expect(result.entries[0]?.playerName).toBe('Alice')
      expect(result.entries[0]?.score).toBe(500)
    })

    it('deve persistir o nome do jogador como último nome', () => {
      addLeaderboardEntry(makeEntry({ playerName: 'Bob' }))
      expect(getLastPlayerName()).toBe('Bob')
    })

    it('deve acumular múltiplas entradas no storage', () => {
      addLeaderboardEntry(makeEntry({ playerName: 'Alice', score: 100 }))
      addLeaderboardEntry(makeEntry({ playerName: 'Bob', score: 200 }))
      const data = loadLeaderboardData()
      expect(data.entries).toHaveLength(2)
    })

    it('deve gerar ids únicos para cada entrada', () => {
      addLeaderboardEntry(makeEntry({ playerName: 'Alice' }))
      addLeaderboardEntry(makeEntry({ playerName: 'Alice' }))
      const data = loadLeaderboardData()
      const ids = data.entries.map((e) => e.id)
      expect(new Set(ids).size).toBe(2)
    })
  })

  describe('getTopOverall', () => {
    it('deve retornar no máximo TOP_N entradas', () => {
      for (let i = 0; i < TOP_N + 5; i++) {
        addLeaderboardEntry(makeEntry({ score: i * 10, timestamp: i }))
      }
      const top = getTopOverall()
      expect(top).toHaveLength(TOP_N)
    })

    it('deve retornar as entradas com maior pontuação', () => {
      addLeaderboardEntry(makeEntry({ score: 50 }))
      addLeaderboardEntry(makeEntry({ score: 300 }))
      addLeaderboardEntry(makeEntry({ score: 150 }))
      const top = getTopOverall()
      expect(top[0]?.score).toBe(300)
    })
  })

  describe('getTopByDifficulty', () => {
    it('deve filtrar apenas entradas do modo solicitado', () => {
      addLeaderboardEntry(makeEntry({ difficulty: 'facil', score: 100 }))
      addLeaderboardEntry(makeEntry({ difficulty: 'dificil', score: 400 }))
      addLeaderboardEntry(makeEntry({ difficulty: 'facil', score: 200 }))

      const topFacil = getTopByDifficulty('facil')
      expect(topFacil.every((e) => e.difficulty === 'facil')).toBe(true)
      expect(topFacil).toHaveLength(2)
    })

    it('deve retornar no máximo TOP_N entradas por modo', () => {
      for (let i = 0; i < TOP_N + 3; i++) {
        addLeaderboardEntry(makeEntry({ difficulty: 'medio', score: i * 10, timestamp: i }))
      }
      expect(getTopByDifficulty('medio')).toHaveLength(TOP_N)
    })

    it('deve retornar array vazio quando não há entradas para o modo', () => {
      addLeaderboardEntry(makeEntry({ difficulty: 'facil' }))
      expect(getTopByDifficulty('extremo')).toHaveLength(0)
    })
  })

  describe('getLastPlayerName', () => {
    it('deve retornar string vazia quando não há nome salvo', () => {
      expect(getLastPlayerName()).toBe('')
    })

    it('deve retornar o nome do último jogador que salvou pontuação', () => {
      addLeaderboardEntry(makeEntry({ playerName: 'Maria' }))
      expect(getLastPlayerName()).toBe('Maria')
    })
  })
})
