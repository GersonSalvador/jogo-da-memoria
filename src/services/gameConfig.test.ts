import { describe, expect, it } from 'vitest'
import { CARD_THEME, COLOR_THEMES, DIFFICULTIES } from './gameConfig'

describe('Configuração do jogo', () => {
  it('deve expor 4 dificuldades pré-definidas', () => {
    expect(Object.keys(DIFFICULTIES)).toEqual(['facil', 'medio', 'dificil', 'extremo'])
  })

  it('deve mapear quantidade de cartas e tempo por dificuldade', () => {
    expect(DIFFICULTIES.facil.totalCards).toBe(8)
    expect(DIFFICULTIES.facil.timeLimitSeconds).toBe(120)

    expect(DIFFICULTIES.medio.totalCards).toBe(12)
    expect(DIFFICULTIES.medio.timeLimitSeconds).toBe(150)

    expect(DIFFICULTIES.dificil.totalCards).toBe(16)
    expect(DIFFICULTIES.dificil.timeLimitSeconds).toBe(180)

    expect(DIFFICULTIES.extremo.totalCards).toBe(20)
    expect(DIFFICULTIES.extremo.timeLimitSeconds).toBe(210)
  })

  it('deve garantir quantidade de cartas sempre par', () => {
    for (const config of Object.values(DIFFICULTIES)) {
      expect(config.totalCards % 2).toBe(0)
    }
  })

  it('deve expor tema fixo de cartas como bottts', () => {
    expect(CARD_THEME).toBe('bottts')
  })

  it('deve expor 5 temas de cor do layout', () => {
    expect(Object.keys(COLOR_THEMES)).toEqual(['roxo', 'oceano', 'floresta', 'solar', 'rosa'])
  })
})
