type ScoreInput = {
  matchedPairs: number
  remainingSeconds: number
  errors: number
}

const PAIR_POINTS = 100
const TIME_BONUS_MULTIPLIER = 10
const ERROR_PENALTY = 15

export const calculateScore = ({ matchedPairs, remainingSeconds, errors }: ScoreInput): number => {
  return matchedPairs * PAIR_POINTS + remainingSeconds * TIME_BONUS_MULTIPLIER - errors * ERROR_PENALTY
}
