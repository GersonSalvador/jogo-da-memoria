import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, THEMES } from './gameConfig'

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

  it('deve expor 3 temas fixos', () => {
    expect(THEMES).toEqual(['avataaars', 'bottts', 'pixel-art'])
  })
})
