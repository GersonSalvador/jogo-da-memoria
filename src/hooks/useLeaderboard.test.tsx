import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '../services/gameConfig.ts'
import { addLeaderboardEntry, TOP_N } from '../services/leaderboard.ts'
import { useLeaderboard } from './useLeaderboard.ts'

describe('useLeaderboard', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('deve retornar true ao salvar quando ainda não há 10 entradas no geral', () => {
    const { result } = renderHook(() => useLeaderboard())

    let reachedTopOverall = false

    act(() => {
      reachedTopOverall = result.current.saveEntry({
        playerName: 'Jogador Novo',
        score: 120,
        difficulty: 'facil',
        matchedPairs: 3,
        errors: 1,
        remainingSeconds: DIFFICULTIES.facil.timeLimitSeconds,
      })
    })

    expect(reachedTopOverall).toBe(true)
  })

  it('deve retornar false ao salvar quando pontuação não entra no top 10 geral', () => {
    for (let index = 0; index < TOP_N; index += 1) {
      addLeaderboardEntry({
        playerName: `Seed ${index}`,
        score: 1_000 - index,
        difficulty: 'facil',
        matchedPairs: 4,
        errors: 0,
        remainingSeconds: 10,
        timestamp: 1000 + index,
      })
    }

    const { result } = renderHook(() => useLeaderboard())

    let reachedTopOverall = true

    act(() => {
      reachedTopOverall = result.current.saveEntry({
        playerName: 'Pontuacao Baixa',
        score: 10,
        difficulty: 'facil',
        matchedPairs: 1,
        errors: 5,
        remainingSeconds: 1,
      })
    })

    expect(reachedTopOverall).toBe(false)
  })
})
