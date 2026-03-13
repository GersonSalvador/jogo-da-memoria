import { describe, expect, it } from 'vitest'
import { CARD_THEME, DIFFICULTIES, UI_THEMES } from './gameConfig'

describe('Configuração do jogo', () => {
  it('deve expor 4 dificuldades pré-definidas', () => {
    expect(Object.keys(DIFFICULTIES)).toEqual(['facil', 'medio', 'dificil', 'extremo'])
  })

  it('deve mapear quantidade de cartas e tempo por dificuldade', () => {
    expect(DIFFICULTIES.facil.rows).toBe(4)
    expect(DIFFICULTIES.facil.columns).toBe(4)
    expect(DIFFICULTIES.facil.totalCards).toBe(16)
    expect(DIFFICULTIES.facil.timeLimitSeconds).toBe(120)

    expect(DIFFICULTIES.medio.rows).toBe(6)
    expect(DIFFICULTIES.medio.columns).toBe(6)
    expect(DIFFICULTIES.medio.totalCards).toBe(36)
    expect(DIFFICULTIES.medio.timeLimitSeconds).toBe(270)

    expect(DIFFICULTIES.dificil.rows).toBe(8)
    expect(DIFFICULTIES.dificil.columns).toBe(8)
    expect(DIFFICULTIES.dificil.totalCards).toBe(64)
    expect(DIFFICULTIES.dificil.timeLimitSeconds).toBe(480)

    expect(DIFFICULTIES.extremo.rows).toBe(10)
    expect(DIFFICULTIES.extremo.columns).toBe(10)
    expect(DIFFICULTIES.extremo.totalCards).toBe(100)
    expect(DIFFICULTIES.extremo.timeLimitSeconds).toBe(750)
  })

  it('deve garantir grades quadradas e quantidade de cartas sempre par', () => {
    for (const config of Object.values(DIFFICULTIES)) {
      expect(config.rows).toBe(config.columns)
      expect(config.totalCards % 2).toBe(0)
    }
  })

  it('deve expor tema fixo de cartas como bottts', () => {
    expect(CARD_THEME).toBe('bottts')
  })

  it('deve expor 4 temas visuais do layout', () => {
    expect(Object.keys(UI_THEMES)).toEqual(['claro', 'escuro', 'sepia', 'oceano'])
  })
})
