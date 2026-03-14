import { useEffect, useMemo, useReducer } from 'react'
import {
  CARD_PATTERNS,
  DIFFICULTIES,
  type CardPatternKey,
  type DifficultyKey,
} from '../services/gameConfig.ts'
import { createDeck, type MemoryCard } from '../services/memoryDeck.ts'
import { calculateScore } from '../services/scoring.ts'

export type GamePhase = 'setup' | 'playing' | 'won' | 'lost'

type MemoryGameState = {
  difficulty: DifficultyKey
  cardPattern: CardPatternKey
  phase: GamePhase
  currentGameHighlight: {
    score: number
    difficulty: DifficultyKey
  } | null
  cards: MemoryCard[]
  flippedCardIds: string[]
  errors: number
  matchedPairs: number
  remainingSeconds: number
  score: number
  isResolving: boolean
  isInitializingRound: boolean
  showSaveModal: boolean
}

type StartGamePayload = {
  cards: MemoryCard[]
  timeLimitSeconds: number
}

const CARD_PATTERN_STORAGE_KEY = 'memory-game.card-pattern'

const getInitialCardPattern = (): CardPatternKey => {
  if (typeof window === 'undefined') {
    return 'classico'
  }

  const storedPattern = window.localStorage.getItem(
    CARD_PATTERN_STORAGE_KEY,
  ) as CardPatternKey | null

  if (storedPattern && storedPattern in CARD_PATTERNS) {
    return storedPattern
  }

  return 'classico'
}

type MemoryGameAction =
  | { type: 'SET_DIFFICULTY'; payload: DifficultyKey }
  | { type: 'SET_CARD_PATTERN'; payload: CardPatternKey }
  | { type: 'START_GAME'; payload: StartGamePayload }
  | { type: 'SHOW_ROUND_PREVIEW' }
  | { type: 'CARD_CLICK'; payload: string }
  | { type: 'HIDE_MISMATCH' }
  | { type: 'TICK' }
  | { type: 'ABANDON_GAME' }
  | { type: 'BACK_TO_SETUP' }
  | { type: 'COMPLETE_ROUND_INITIALIZATION' }
  | { type: 'CLOSE_SAVE_MODAL' }

const initialState: MemoryGameState = {
  difficulty: 'facil',
  cardPattern: getInitialCardPattern(),
  phase: 'setup',
  currentGameHighlight: null,
  cards: [],
  flippedCardIds: [],
  errors: 0,
  matchedPairs: 0,
  remainingSeconds: 0,
  score: 0,
  isResolving: false,
  isInitializingRound: false,
  showSaveModal: false,
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

    case 'SET_CARD_PATTERN': {
      return {
        ...state,
        cardPattern: action.payload,
      }
    }

    case 'START_GAME': {
      return {
        ...state,
        currentGameHighlight: null,
        cards: action.payload.cards.map((card) => ({
          ...card,
          isFaceUp: false,
          isMatched: false,
        })),
        flippedCardIds: [],
        errors: 0,
        matchedPairs: 0,
        remainingSeconds: action.payload.timeLimitSeconds,
        score: 0,
        isResolving: false,
        isInitializingRound: true,
        phase: 'playing',
      }
    }

    case 'SHOW_ROUND_PREVIEW': {
      if (!state.isInitializingRound || state.phase !== 'playing') {
        return state
      }

      return {
        ...state,
        cards: state.cards.map((card) => ({
          ...card,
          isFaceUp: true,
        })),
      }
    }

    case 'CARD_CLICK': {
      if (state.phase !== 'playing' || state.isResolving || state.isInitializingRound) {
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
            currentGameHighlight: {
              score: finalScore,
              difficulty: state.difficulty,
            },
            showSaveModal: true,
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
      if (state.phase !== 'playing' || state.isInitializingRound) {
        return state
      }

      const nextRemainingSeconds = Math.max(state.remainingSeconds - 1, 0)
      if (nextRemainingSeconds === 0) {
        const finalScore = calculateScore({
          matchedPairs: state.matchedPairs,
          remainingSeconds: 0,
          errors: state.errors,
        })

        return {
          ...state,
          cards: state.cards.map((card) => ({
            ...card,
            isFaceUp: true,
          })),
          flippedCardIds: [],
          isResolving: false,
          remainingSeconds: 0,
          score: finalScore,
          currentGameHighlight: {
            score: finalScore,
            difficulty: state.difficulty,
          },
          phase: 'lost',
        }
      }

      return {
        ...state,
        remainingSeconds: nextRemainingSeconds,
      }
    }

    case 'ABANDON_GAME': {
      return {
        ...state,
        cards: [],
        flippedCardIds: [],
        errors: 0,
        matchedPairs: 0,
        remainingSeconds: 0,
        score: 0,
        isResolving: false,
        isInitializingRound: false,
        showSaveModal: false,
        phase: 'setup',
      }
    }

    case 'BACK_TO_SETUP': {
      return {
        ...state,
        phase: 'setup',
        isInitializingRound: false,
        showSaveModal: false,
      }
    }

    case 'COMPLETE_ROUND_INITIALIZATION': {
      if (!state.isInitializingRound || state.phase !== 'playing') {
        return state
      }

      return {
        ...state,
        cards: state.cards.map((card) => ({
          ...card,
          isFaceUp: false,
        })),
        flippedCardIds: [],
        isInitializingRound: false,
      }
    }

    case 'CLOSE_SAVE_MODAL': {
      return {
        ...state,
        showSaveModal: false,
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
  const cardPatternOptions = useMemo(() => Object.keys(CARD_PATTERNS) as CardPatternKey[], [])
  const boardColumns = selectedDifficulty.columns
  const boardRows = useMemo(() => {
    if (state.cards.length === 0) {
      return [] as MemoryCard[][]
    }

    const rowSize = boardColumns
    const rows: MemoryCard[][] = []

    for (let index = 0; index < state.cards.length; index += rowSize) {
      rows.push(state.cards.slice(index, index + rowSize))
    }

    return rows
  }, [boardColumns, state.cards])

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(CARD_PATTERN_STORAGE_KEY, state.cardPattern)
  }, [state.cardPattern])

  const setDifficulty = (nextDifficulty: DifficultyKey) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: nextDifficulty })
  }

  const setCardPattern = (nextPattern: CardPatternKey) => {
    dispatch({ type: 'SET_CARD_PATTERN', payload: nextPattern })
  }

  const startGame = () => {
    const cards = createDeck({
      totalCards: selectedDifficulty.totalCards,
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

  const abandonGame = () => {
    dispatch({ type: 'ABANDON_GAME' })
  }

  const closeSaveModal = () => {
    dispatch({ type: 'CLOSE_SAVE_MODAL' })
  }

  const completeRoundInitialization = () => {
    dispatch({ type: 'COMPLETE_ROUND_INITIALIZATION' })
  }

  const showRoundPreview = () => {
    dispatch({ type: 'SHOW_ROUND_PREVIEW' })
  }

  return {
    difficulty: state.difficulty,
    cardPattern: state.cardPattern,
    phase: state.phase,
    currentGameHighlight: state.currentGameHighlight,
    errors: state.errors,
    matchedPairs: state.matchedPairs,
    remainingSeconds: state.remainingSeconds,
    score: state.score,
    isResolving: state.isResolving,
    isInitializingRound: state.isInitializingRound,
    showSaveModal: state.showSaveModal,
    boardColumns,
    boardRows,
    difficultyOptions,
    cardPatternOptions,
    setDifficulty,
    setCardPattern,
    startGame,
    handleCardClick,
    handlePlayAgain,
    abandonGame,
    closeSaveModal,
    showRoundPreview,
    completeRoundInitialization,
  }
}
