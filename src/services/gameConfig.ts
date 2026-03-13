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

export const UI_THEMES = {
  claro: {
    label: 'Claro',
    icon: 'sun',
  },
  escuro: {
    label: 'Escuro',
    icon: 'moon',
  },
  sepia: {
    label: 'Sepia',
    icon: 'book',
  },
  oceano: {
    label: 'Oceano',
    icon: 'wave',
  },
} as const

/** Estilo fixo das cartas — Bots (bottts do DiceBear) */
export const CARD_THEME = 'bottts' as const

export type DifficultyKey = keyof typeof DIFFICULTIES
export type UiThemeKey = keyof typeof UI_THEMES
