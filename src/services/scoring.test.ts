import { describe, expect, it } from 'vitest'
import { calculateScore } from './scoring'

describe('Pontuação', () => {
  it('deve calcular score usando fórmula base aprovada', () => {
    const score = calculateScore({
      matchedPairs: 4,
      remainingSeconds: 30,
      errors: 2,
    })

    expect(score).toBe(670)
  })

  it('deve permitir score negativo quando erros superam progresso', () => {
    const score = calculateScore({
      matchedPairs: 0,
      remainingSeconds: 0,
      errors: 1,
    })

    expect(score).toBe(-15)
  })

  it('deve retornar score alto para vitória rápida sem erros', () => {
    const score = calculateScore({
      matchedPairs: 10,
      remainingSeconds: 180,
      errors: 0,
    })

    expect(score).toBe(2800)
  })
})
