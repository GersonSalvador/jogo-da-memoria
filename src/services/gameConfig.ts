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

/** Estilo fixo das cartas — Bots (bottts do DiceBear) */
export const CARD_THEME = 'bottts' as const

/** Temas de cor do layout do aplicativo */
export const COLOR_THEMES = {
  roxo:     { label: 'Roxo',     accent: '#aa3bff' },
  oceano:   { label: 'Oceano',   accent: '#3b82f6' },
  floresta: { label: 'Floresta', accent: '#22c55e' },
  solar:    { label: 'Solar',    accent: '#f97316' },
  rosa:     { label: 'Rosa',     accent: '#ec4899' },
} as const

export type DifficultyKey = keyof typeof DIFFICULTIES
export type ColorThemeKey = keyof typeof COLOR_THEMES
