import type { DifficultyKey } from './gameConfig.ts'
import type { LeaderboardData, LeaderboardEntry } from '../types/leaderboard.ts'
import { TOP_N } from '../types/leaderboard.ts'

export { TOP_N }

const STORAGE_KEY = 'memory-game.leaderboard'
const LAST_NAME_KEY = 'memory-game.last-player-name'

const emptyData = (): LeaderboardData => ({ entries: [], lastPlayerName: '' })

export const loadLeaderboardData = (): LeaderboardData => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as LeaderboardData).entries)
    ) {
      return parsed as LeaderboardData
    }
    return emptyData()
  } catch {
    return emptyData()
  }
}

const persistData = (data: LeaderboardData): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const sortByScore = (entries: LeaderboardEntry[]): LeaderboardEntry[] =>
  [...entries].sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)

export const addLeaderboardEntry = (entry: Omit<LeaderboardEntry, 'id'>): LeaderboardData => {
  const data = loadLeaderboardData()
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `${entry.timestamp}-${entry.playerName}-${Math.random().toString(36).slice(2, 9)}`,
  }
  const updated: LeaderboardData = {
    entries: [...data.entries, newEntry],
    lastPlayerName: entry.playerName,
  }
  persistData(updated)
  window.localStorage.setItem(LAST_NAME_KEY, entry.playerName)
  return updated
}

export const getTopOverall = (): LeaderboardEntry[] =>
  sortByScore(loadLeaderboardData().entries).slice(0, TOP_N)

export const getTopByDifficulty = (difficulty: DifficultyKey): LeaderboardEntry[] =>
  sortByScore(loadLeaderboardData().entries.filter((e) => e.difficulty === difficulty)).slice(
    0,
    TOP_N,
  )

export const getLastPlayerName = (): string => window.localStorage.getItem(LAST_NAME_KEY) ?? ''
