import { useEffect, useMemo, useReducer } from 'react'
import { DIFFICULTIES, type DifficultyKey, THEMES, type ThemeKey } from '../services/gameConfig.ts'
import { createDeck, type MemoryCard } from '../services/memoryDeck.ts'
import { calculateScore } from '../services/scoring.ts'

export type GamePhase = 'setup' | 'playing' | 'won' | 'lost'

type MemoryGameState = {
  difficulty: DifficultyKey
  theme: ThemeKey
  phase: GamePhase
  cards: MemoryCard[]
  flippedCardIds: string[]
  errors: number
  matchedPairs: number
  remainingSeconds: number
  score: number
  isResolving: boolean
}

type StartGamePayload = {
  cards: MemoryCard[]
  timeLimitSeconds: number
}

type MemoryGameAction =
  | { type: 'SET_DIFFICULTY'; payload: DifficultyKey }
  | { type: 'SET_THEME'; payload: ThemeKey }
  | { type: 'START_GAME'; payload: StartGamePayload }
  | { type: 'CARD_CLICK'; payload: string }
  | { type: 'HIDE_MISMATCH' }
  | { type: 'TICK' }
  | { type: 'BACK_TO_SETUP' }

const initialState: MemoryGameState = {
  difficulty: 'facil',
  theme: 'avataaars',
  phase: 'setup',
  cards: [],
  flippedCardIds: [],
  errors: 0,
  matchedPairs: 0,
  remainingSeconds: 0,
  score: 0,
  isResolving: false,
}

const calculateLiveScore = (matchedPairs: number, errors: number): number => {
  return calculateScore({
    matchedPairs,
    remainingSeconds: 0,
    errors,
  })
}

const memoryGameReducer = (state: MemoryGameState, action: MemoryGameAction): MemoryGameState => {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      if (state.phase !== 'setup') {
        return state
      }

      return {
        ...state,
        difficulty: action.payload,
      }
    }

    case 'SET_THEME': {
      if (state.phase !== 'setup') {
        return state
      }

      return {
        ...state,
        theme: action.payload,
      }
    }

    case 'START_GAME': {
      return {
        ...state,
        cards: action.payload.cards,
        flippedCardIds: [],
        errors: 0,
        matchedPairs: 0,
        remainingSeconds: action.payload.timeLimitSeconds,
        score: 0,
        isResolving: false,
        phase: 'playing',
      }
    }

    case 'CARD_CLICK': {
      if (state.phase !== 'playing' || state.isResolving) {
        return state
      }

      const clickedCard = state.cards.find((card) => card.id === action.payload)
      if (
        !clickedCard ||
        clickedCard.isFaceUp ||
        clickedCard.isMatched ||
        state.flippedCardIds.length >= 2
      ) {
        return state
      }

      const nextCards = state.cards.map((card) =>
        card.id === action.payload ? { ...card, isFaceUp: true } : card,
      )
      const nextFlippedCardIds = [...state.flippedCardIds, action.payload]

      if (nextFlippedCardIds.length < 2) {
        return {
          ...state,
          cards: nextCards,
          flippedCardIds: nextFlippedCardIds,
        }
      }

      const firstCard = nextCards.find((card) => card.id === nextFlippedCardIds[0])
      const secondCard = nextCards.find((card) => card.id === nextFlippedCardIds[1])

      if (!firstCard || !secondCard) {
        return {
          ...state,
          cards: nextCards,
          flippedCardIds: nextFlippedCardIds,
        }
      }

      if (firstCard.pairId === secondCard.pairId) {
        const matchedCards = nextCards.map((card) =>
          nextFlippedCardIds.includes(card.id) ? { ...card, isMatched: true } : card,
        )
        const nextMatchedPairs = state.matchedPairs + 1
        const hasWon = nextMatchedPairs === matchedCards.length / 2

        if (hasWon) {
          const finalScore = calculateScore({
            matchedPairs: nextMatchedPairs,
            remainingSeconds: state.remainingSeconds,
            errors: state.errors,
          })

          return {
            ...state,
            cards: matchedCards,
            flippedCardIds: [],
            matchedPairs: nextMatchedPairs,
            score: finalScore,
            phase: 'won',
          }
        }

        return {
          ...state,
          cards: matchedCards,
          flippedCardIds: [],
          matchedPairs: nextMatchedPairs,
          score: calculateLiveScore(nextMatchedPairs, state.errors),
        }
      }

      const nextErrors = state.errors + 1

      return {
        ...state,
        cards: nextCards,
        flippedCardIds: nextFlippedCardIds,
        errors: nextErrors,
        score: calculateLiveScore(state.matchedPairs, nextErrors),
        isResolving: true,
      }
    }

    case 'HIDE_MISMATCH': {
      if (!state.isResolving || state.flippedCardIds.length !== 2) {
        return state
      }

      return {
        ...state,
        cards: state.cards.map((card) =>
          state.flippedCardIds.includes(card.id) && !card.isMatched
            ? { ...card, isFaceUp: false }
            : card,
        ),
        flippedCardIds: [],
        isResolving: false,
      }
    }

    case 'TICK': {
      if (state.phase !== 'playing') {
        return state
      }

      const nextRemainingSeconds = Math.max(state.remainingSeconds - 1, 0)
      if (nextRemainingSeconds === 0) {
        return {
          ...state,
          remainingSeconds: 0,
          score: calculateScore({
            matchedPairs: state.matchedPairs,
            remainingSeconds: 0,
            errors: state.errors,
          }),
          phase: 'lost',
        }
      }

      return {
        ...state,
        remainingSeconds: nextRemainingSeconds,
      }
    }

    case 'BACK_TO_SETUP': {
      return {
        ...state,
        phase: 'setup',
      }
    }

    default: {
      return state
    }
  }
}

export const useMemoryGame = () => {
  const [state, dispatch] = useReducer(memoryGameReducer, initialState)

  const selectedDifficulty = useMemo(() => DIFFICULTIES[state.difficulty], [state.difficulty])
  const difficultyOptions = useMemo(() => Object.keys(DIFFICULTIES) as DifficultyKey[], [])
  const boardRows = useMemo(() => {
    if (state.cards.length === 0) {
      return [] as MemoryCard[][]
    }

    const rowSize = Math.ceil(Math.sqrt(state.cards.length))
    const rows: MemoryCard[][] = []

    for (let index = 0; index < state.cards.length; index += rowSize) {
      rows.push(state.cards.slice(index, index + rowSize))
    }

    return rows
  }, [state.cards])

  useEffect(() => {
    if (state.phase !== 'playing') {
      return
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [state.phase])

  useEffect(() => {
    if (!state.isResolving) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'HIDE_MISMATCH' })
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [state.isResolving])

  const setDifficulty = (nextDifficulty: DifficultyKey) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: nextDifficulty })
  }

  const setTheme = (nextTheme: ThemeKey) => {
    dispatch({ type: 'SET_THEME', payload: nextTheme })
  }

  const startGame = () => {
    const cards = createDeck({
      totalCards: selectedDifficulty.totalCards,
      theme: state.theme,
    })

    dispatch({
      type: 'START_GAME',
      payload: {
        cards,
        timeLimitSeconds: selectedDifficulty.timeLimitSeconds,
      },
    })
  }

  const handleCardClick = (cardId: string) => {
    dispatch({ type: 'CARD_CLICK', payload: cardId })
  }

  const handlePlayAgain = () => {
    dispatch({ type: 'BACK_TO_SETUP' })
  }

  return {
    difficulty: state.difficulty,
    theme: state.theme,
    phase: state.phase,
    errors: state.errors,
    remainingSeconds: state.remainingSeconds,
    score: state.score,
    isResolving: state.isResolving,
    boardRows,
    difficultyOptions,
    themes: THEMES,
    setDifficulty,
    setTheme,
    startGame,
    handleCardClick,
    handlePlayAgain,
  }
}
