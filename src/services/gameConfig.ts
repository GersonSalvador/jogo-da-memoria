const BASE_TIME_SECONDS = 120
const BASE_TOTAL_CARDS = 16

const calculateTimeLimitSeconds = (totalCards: number): number => {
  return Math.round((BASE_TIME_SECONDS * totalCards) / BASE_TOTAL_CARDS)
}

const createSquareDifficulty = (label: string, size: number) => {
  const totalCards = size * size

  return {
    label,
    rows: size,
    columns: size,
    totalCards,
    timeLimitSeconds: calculateTimeLimitSeconds(totalCards),
  }
}

export const DIFFICULTIES = {
  facil: createSquareDifficulty('Fácil', 4),
  medio: createSquareDifficulty('Médio', 6),
  dificil: createSquareDifficulty('Difícil', 8),
  extremo: createSquareDifficulty('Extremo', 10),
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

export const CARD_PATTERNS = {
  classico: {
    label: 'Clássico',
  },
  listras: {
    label: 'Listras diagonais',
  },
  pontos: {
    label: 'Pontos',
  },
  ondas: {
    label: 'Ondas suaves',
  },
  grade: {
    label: 'Grade geometrica',
  },
} as const

/** Estilo fixo das cartas — Bots (bottts do DiceBear) */
export const CARD_THEME = 'bottts' as const

export type DifficultyKey = keyof typeof DIFFICULTIES
export type UiThemeKey = keyof typeof UI_THEMES
export type CardPatternKey = keyof typeof CARD_PATTERNS
