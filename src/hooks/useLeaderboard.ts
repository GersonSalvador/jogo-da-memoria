import { useState } from 'react'
import type { DifficultyKey } from '../services/gameConfig.ts'
import {
  addLeaderboardEntry,
  getLastPlayerName,
  getTopByDifficulty,
  getTopOverall,
  TOP_N,
} from '../services/leaderboard.ts'
import type { LeaderboardEntry } from '../types/leaderboard.ts'

type SaveEntryInput = Omit<LeaderboardEntry, 'id' | 'timestamp'>

export const useLeaderboard = () => {
  const [topOverall, setTopOverall] = useState<LeaderboardEntry[]>(getTopOverall)
  const [lastPlayerName, setLastPlayerName] = useState<string>(getLastPlayerName)

  const isScoreEligibleForTopOverall = (score: number): boolean => {
    if (topOverall.length < TOP_N) {
      return true
    }

    const minimumTopScore = topOverall[topOverall.length - 1]?.score ?? Number.MAX_SAFE_INTEGER

    return score >= minimumTopScore
  }

  const saveEntry = (input: SaveEntryInput): boolean => {
    addLeaderboardEntry({ ...input, timestamp: Date.now() })
    const nextTopOverall = getTopOverall()

    setTopOverall(nextTopOverall)
    setLastPlayerName(input.playerName)

    if (nextTopOverall.length < TOP_N) {
      return true
    }

    const minimumTopScore =
      nextTopOverall[nextTopOverall.length - 1]?.score ?? Number.MAX_SAFE_INTEGER

    return input.score >= minimumTopScore
  }

  const getTopForDifficulty = (difficulty: DifficultyKey): LeaderboardEntry[] =>
    getTopByDifficulty(difficulty)

  return {
    topOverall,
    lastPlayerName,
    saveEntry,
    getTopForDifficulty,
    isScoreEligibleForTopOverall,
  }
}
