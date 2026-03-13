import { useEffect, useMemo, useState } from 'react'
import { DIFFICULTIES, THEMES, type DifficultyKey, type ThemeKey } from './services/gameConfig.ts'
import { createDeck, type MemoryCard } from './services/memoryDeck.ts'
import { calculateScore } from './services/scoring.ts'
import './App.css'

type GamePhase = 'setup' | 'playing' | 'won' | 'lost'

const calculateLiveScore = (matchedPairs: number, errors: number): number => {
  return calculateScore({
    matchedPairs,
    remainingSeconds: 0,
    errors,
  })
}

function App() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>('facil')
  const [theme, setTheme] = useState<ThemeKey>('avataaars')
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCardIds, setFlippedCardIds] = useState<string[]>([])
  const [errors, setErrors] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [score, setScore] = useState(0)
  const [isResolving, setIsResolving] = useState(false)

  const selectedDifficulty = useMemo(() => DIFFICULTIES[difficulty], [difficulty])
  const difficultyOptions = useMemo(() => Object.keys(DIFFICULTIES) as DifficultyKey[], [])
  const boardRows = useMemo(() => {
    if (cards.length === 0) {
      return [] as MemoryCard[][]
    }

    const rowSize = Math.ceil(Math.sqrt(cards.length))
    const rows: MemoryCard[][] = []

    for (let index = 0; index < cards.length; index += rowSize) {
      rows.push(cards.slice(index, index + rowSize))
    }

    return rows
  }, [cards])

  useEffect(() => {
    if (phase !== 'playing') {
      return
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((currentTime) => {
        const nextTime = Math.max(currentTime - 1, 0)

        if (nextTime === 0) {
          setScore(
            calculateScore({
              matchedPairs,
              remainingSeconds: 0,
              errors,
            }),
          )
          setPhase('lost')
        }

        return nextTime
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [errors, matchedPairs, phase])

  const startGame = () => {
    const nextCards = createDeck({
      totalCards: selectedDifficulty.totalCards,
      theme,
    })

    setCards(nextCards)
    setFlippedCardIds([])
    setErrors(0)
    setMatchedPairs(0)
    setIsResolving(false)
    setRemainingSeconds(selectedDifficulty.timeLimitSeconds)
    setScore(0)
    setPhase('playing')
  }

  const handlePlayAgain = () => {
    setPhase('setup')
  }

  const handleCardClick = (cardId: string) => {
    if (phase !== 'playing' || isResolving) {
      return
    }

    const clickedCard = cards.find((card) => card.id === cardId)
    if (
      !clickedCard ||
      clickedCard.isFaceUp ||
      clickedCard.isMatched ||
      flippedCardIds.length >= 2
    ) {
      return
    }

    const nextCards = cards.map((card) => (card.id === cardId ? { ...card, isFaceUp: true } : card))
    const nextFlippedCardIds = [...flippedCardIds, cardId]

    setCards(nextCards)
    setFlippedCardIds(nextFlippedCardIds)

    if (nextFlippedCardIds.length < 2) {
      return
    }

    const firstCard = nextCards.find((card) => card.id === nextFlippedCardIds[0])
    const secondCard = nextCards.find((card) => card.id === nextFlippedCardIds[1])

    if (!firstCard || !secondCard) {
      return
    }

    if (firstCard.pairId === secondCard.pairId) {
      const matchedCards = nextCards.map((card) =>
        nextFlippedCardIds.includes(card.id) ? { ...card, isMatched: true } : card,
      )
      const nextMatchedPairs = matchedPairs + 1

      setCards(matchedCards)
      setMatchedPairs(nextMatchedPairs)
      setFlippedCardIds([])

      const nextScore = calculateScore({
        matchedPairs: nextMatchedPairs,
        remainingSeconds: 0,
        errors,
      })
      setScore(nextScore)

      if (nextMatchedPairs === matchedCards.length / 2) {
        setScore(
          calculateScore({
            matchedPairs: nextMatchedPairs,
            remainingSeconds,
            errors,
          }),
        )
        setPhase('won')
      }

      return
    }

    const nextErrors = errors + 1
    setErrors(nextErrors)
    setScore(calculateLiveScore(matchedPairs, nextErrors))
    setIsResolving(true)

    window.setTimeout(() => {
      setCards((currentCards) =>
        currentCards.map((card) =>
          nextFlippedCardIds.includes(card.id) && !card.isMatched
            ? { ...card, isFaceUp: false }
            : card,
        ),
      )
      setFlippedCardIds([])
      setIsResolving(false)
    }, 500)
  }

  return (
    <main className="memory-game">
      <h1>Jogo da Memória</h1>

      {phase === 'setup' && (
        <section className="setup-panel" aria-label="Configuração da partida">
          <label htmlFor="difficulty">Dificuldade</label>
          <select
            id="difficulty"
            name="difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as DifficultyKey)}
          >
            {difficultyOptions.map((difficultyOption) => (
              <option key={difficultyOption} value={difficultyOption}>
                {DIFFICULTIES[difficultyOption].label}
              </option>
            ))}
          </select>

          <label htmlFor="theme">Tema</label>
          <select
            id="theme"
            name="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemeKey)}
          >
            {THEMES.map((themeOption) => (
              <option key={themeOption} value={themeOption}>
                {themeOption}
              </option>
            ))}
          </select>

          <button type="button" onClick={startGame}>
            Iniciar partida
          </button>
        </section>
      )}

      {phase !== 'setup' && (
        <>
          <section className="scoreboard" aria-label="Placar da partida">
            <p>Tempo restante: {remainingSeconds}</p>
            <p>Erros: {errors}</p>
            <p>Pontuação: {score}</p>
          </section>

          <table className="board" role="grid" aria-label="Tabuleiro de cartas">
            <tbody>
              {boardRows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((card) => (
                    <td key={card.id}>
                      <button
                        type="button"
                        className="card"
                        aria-label="Carta"
                        onClick={() => handleCardClick(card.id)}
                        disabled={
                          phase !== 'playing' || card.isMatched || card.isFaceUp || isResolving
                        }
                      >
                        {card.isFaceUp || card.isMatched ? (
                          <img src={card.face} alt={`Face ${card.pairId + 1}`} loading="lazy" />
                        ) : (
                          <span className="card-back">?</span>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {phase === 'lost' && (
            <section className="result-panel" aria-live="assertive">
              <h2>Tempo esgotado</h2>
              <p>Pontuação final: {score}</p>
              <button type="button" onClick={handlePlayAgain}>
                Jogar novamente
              </button>
            </section>
          )}

          {phase === 'won' && (
            <section className="result-panel" aria-live="assertive">
              <h2>Você venceu</h2>
              <p>Pontuação final: {score}</p>
              <button type="button" onClick={handlePlayAgain}>
                Jogar novamente
              </button>
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default App
