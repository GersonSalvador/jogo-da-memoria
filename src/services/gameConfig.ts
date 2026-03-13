export const DIFFICULTIES = {
  facil: {
    label: 'Fácil',
    totalCards: 8,
    timeLimitSeconds: 120,
  },
  medio: {
    label: 'Médio',
    totalCards: 12,
    timeLimitSeconds: 150,
  },
  dificil: {
    label: 'Difícil',
    totalCards: 16,
    timeLimitSeconds: 180,
  },
  extremo: {
    label: 'Extremo',
    totalCards: 20,
    timeLimitSeconds: 210,
  },
} as const

export const THEMES = ['avataaars', 'bottts', 'pixel-art'] as const

export type DifficultyKey = keyof typeof DIFFICULTIES
export type ThemeKey = (typeof THEMES)[number]
