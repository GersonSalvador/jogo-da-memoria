import type { DifficultyKey } from '../services/gameConfig.ts'

export type LeaderboardEntry = {
  id: string
  playerName: string
  score: number
  difficulty: DifficultyKey
  matchedPairs: number
  errors: number
  remainingSeconds: number
  timestamp: number
}

export type LeaderboardData = {
  entries: LeaderboardEntry[]
  lastPlayerName: string
}

export const TOP_N = 10
