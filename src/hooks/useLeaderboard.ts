import { useState } from 'react'
import type { DifficultyKey } from '../services/gameConfig.ts'
import {
  addLeaderboardEntry,
  getLastPlayerName,
  getTopByDifficulty,
  getTopOverall,
} from '../services/leaderboard.ts'
import type { LeaderboardEntry } from '../types/leaderboard.ts'

type SaveEntryInput = Omit<LeaderboardEntry, 'id' | 'timestamp'>

export const useLeaderboard = () => {
  const [topOverall, setTopOverall] = useState<LeaderboardEntry[]>(getTopOverall)
  const [lastPlayerName, setLastPlayerName] = useState<string>(getLastPlayerName)

  const saveEntry = (input: SaveEntryInput) => {
    addLeaderboardEntry({ ...input, timestamp: Date.now() })
    setTopOverall(getTopOverall())
    setLastPlayerName(input.playerName)
  }

  const getTopForDifficulty = (difficulty: DifficultyKey): LeaderboardEntry[] =>
    getTopByDifficulty(difficulty)

  return { topOverall, lastPlayerName, saveEntry, getTopForDifficulty }
}
