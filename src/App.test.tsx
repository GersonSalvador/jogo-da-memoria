import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { DIFFICULTIES } from './services/gameConfig'
import App from './App'
import type { MemoryCard } from './services/memoryDeck.ts'

const INITIAL_DEAL_PHASE_MS = 2_200
const INITIAL_ROUND_PREVIEW_TOTAL_MS = 5_000

const startGameAndFinishInitialPreview = async (
  view: ReturnType<typeof render>,
  difficultyLabel: string = DIFFICULTIES.facil.label,
) => {
  fireEvent.click(view.getByRole('button', { name: difficultyLabel }))
  fireEvent.click(view.getByRole('button', { name: /iniciar partida/i }))

  await act(async () => {
    await vi.advanceTimersByTimeAsync(INITIAL_ROUND_PREVIEW_TOTAL_MS)
  })
}

vi.mock('./services/memoryDeck.ts', async () => {
  const actual = (await vi.importActual('./services/memoryDeck.ts')) as Record<string, unknown>

  return {
    ...actual,
    createDeck: ({ totalCards }: { totalCards: number }) => {
      const totalPairs = totalCards / 2
      const deck: MemoryCard[] = []

      for (let pairId = 0; pairId < totalPairs; pairId += 1) {
        const face = `face-${pairId}`
        deck.push({
          id: `${pairId}-a`,
          pairId,
          face,
          isFaceUp: false,
          isMatched: false,
        })
        deck.push({
          id: `${pairId}-b`,
          pairId,
          face,
          isFaceUp: false,
          isMatched: false,
        })
      }

      return deck
    },
  }
})

describe('Jogo da Memória - integração de UI', () => {
  beforeEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.uiTheme
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve renderizar tela inicial com dificuldade e menu de configuracoes do jogador', () => {
    const view = render(<App />)

    expect(view.getByRole('heading', { name: /jogo da memória/i })).toBeInTheDocument()
    expect(view.getByRole('group', { name: /dificuldade/i })).toBeInTheDocument()
    expect(view.queryByRole('combobox', { name: /padrao do verso/i })).not.toBeInTheDocument()
    expect(
      view.getByRole('button', { name: /abrir configuracoes do jogador/i }),
    ).toBeInTheDocument()
    expect(view.getByRole('button', { name: /iniciar partida/i })).toBeInTheDocument()
  })

  it('deve alternar tema pelo menu de configuracoes e persistir no localStorage', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    const settingsButton = view.getByRole('button', { name: /abrir configuracoes do jogador/i })

    expect(document.documentElement.dataset.uiTheme).toBe('claro')

    await user.click(settingsButton)
    await user.click(view.getByRole('menuitemradio', { name: /escuro/i }))
    expect(document.documentElement.dataset.uiTheme).toBe('escuro')

    await user.click(view.getByRole('menuitemradio', { name: /sepia/i }))
    expect(document.documentElement.dataset.uiTheme).toBe('sepia')

    expect(window.localStorage.getItem('memory-game.ui-theme')).toBe('sepia')
  })

  it('deve iniciar partida com dificuldade escolhida e exibir grid de cartas', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.click(view.getByRole('button', { name: /abrir configuracoes do jogador/i }))
    await user.click(view.getByRole('menuitemradio', { name: /pontos/i }))
    await user.click(view.getByRole('button', { name: DIFFICULTIES.medio.label }))
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    expect(view.getByText(/tempo restante:/i)).toHaveTextContent(
      String(DIFFICULTIES.medio.timeLimitSeconds),
    )
    expect(view.getByText(/erros:/i)).toHaveTextContent('0')
    expect(view.getByText(/pontuação:/i)).toHaveTextContent('0')

    const board = view.getByRole('region', { name: /tabuleiro de cartas/i })
    expect(board).toBeInTheDocument()
    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards).toHaveLength(DIFFICULTIES.medio.totalCards)
    expect(view.container.querySelector('[data-card-pattern="pontos"]')).toBeInTheDocument()
  })

  it('deve iniciar com listras como padrao de verso do jogador', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.click(view.getByRole('button', { name: DIFFICULTIES.facil.label }))
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    expect(view.container.querySelector('[data-card-pattern="listras"]')).toBeInTheDocument()
  })

  it('deve atualizar erros e pontuação quando jogador erra um par', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards.length).toBeGreaterThanOrEqual(3)

    fireEvent.click(cards[0]!)
    fireEvent.click(cards[2]!)

    expect(view.getByText(/erros:/i)).toHaveTextContent('1')
    expect(view.getByText(/pontuação:/i)).toHaveTextContent('-15')
  })

  it('deve espalhar cartas ocultas, revelar a prévia e só então liberar o jogo', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    fireEvent.click(view.getByRole('button', { name: DIFFICULTIES.facil.label }))
    fireEvent.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    const firstCard = cards[0]!

    expect(firstCard).toBeDisabled()
    expect(firstCard).toHaveAttribute('data-flipped', 'false')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(INITIAL_DEAL_PHASE_MS)
    })

    expect(firstCard).toBeDisabled()
    expect(firstCard).toHaveAttribute('data-flipped', 'true')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(INITIAL_ROUND_PREVIEW_TOTAL_MS - INITIAL_DEAL_PHASE_MS)
    })

    expect(firstCard).toBeEnabled()
    expect(firstCard).toHaveAttribute('data-flipped', 'false')
  })

  it('deve encerrar com derrota quando o tempo chegar a zero', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    fireEvent.click(view.getByRole('button', { name: DIFFICULTIES.facil.label }))
    fireEvent.click(view.getByRole('button', { name: /iniciar partida/i }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(130_000)
    })

    expect(view.getByRole('heading', { name: /tempo esgotado/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /jogar novamente/i })).toBeInTheDocument()
  })

  it('deve encerrar com vitória e exibir pontuação final', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards.length % 2).toBe(0)

    for (let index = 0; index < cards.length; index += 2) {
      fireEvent.click(cards[index]!)
      fireEvent.click(cards[index + 1]!)
    }

    expect(view.getByRole('dialog', { name: /você venceu/i })).toBeInTheDocument()
    expect(view.getByLabelText(/seu nome/i)).toBeInTheDocument()
  })

  it('deve pré-preencher o campo de nome com o último nome salvo', async () => {
    window.localStorage.setItem('memory-game.last-player-name', 'Fulano')

    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      fireEvent.click(cards[index]!)
      fireEvent.click(cards[index + 1]!)
    }

    expect(view.getByLabelText(/seu nome/i)).toHaveValue('Fulano')
  })

  it('botão salvar deve estar desabilitado quando nome está vazio', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      fireEvent.click(cards[index]!)
      fireEvent.click(cards[index + 1]!)
    }

    const nameInput = view.getByLabelText(/seu nome/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    const saveButton = view.getByRole('button', { name: /salvar pontuação/i })
    expect(saveButton).toBeDisabled()
  })

  it('deve salvar pontuação no ranking e fechar modal ao confirmar nome', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      fireEvent.click(cards[index]!)
      fireEvent.click(cards[index + 1]!)
    }

    const nameInput = view.getByLabelText(/seu nome/i)
    fireEvent.change(nameInput, { target: { value: 'Jogador Teste' } })
    fireEvent.click(view.getByRole('button', { name: /salvar pontuação/i }))

    expect(view.queryByRole('dialog', { name: /você venceu/i })).not.toBeInTheDocument()
    expect(view.getByRole('heading', { name: /você venceu/i })).toBeInTheDocument()
    expect(view.getByText(/melhores pontuações/i)).toBeInTheDocument()
    expect(window.localStorage.getItem('memory-game.last-player-name')).toBe('Jogador Teste')
  })

  it('deve fechar modal sem salvar ao clicar em Pular', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      fireEvent.click(cards[index]!)
      fireEvent.click(cards[index + 1]!)
    }

    fireEvent.click(view.getByRole('button', { name: /pular/i }))
    expect(view.queryByRole('dialog', { name: /você venceu/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('memory-game.last-player-name')).toBeNull()
  })

  it('deve permitir abandonar a partida sem considerar pontuação no ranking', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    await startGameAndFinishInitialPreview(view)

    const cards = view.getAllByRole('button', { name: /carta/i })
    fireEvent.click(cards[0]!)
    fireEvent.click(cards[2]!)

    expect(view.getByText(/pontuação:/i)).toHaveTextContent('-15')

    fireEvent.click(view.getByRole('button', { name: /abandonar partida/i }))

    expect(view.getByRole('group', { name: /dificuldade/i })).toBeInTheDocument()
    expect(view.queryByText(/pontuação:/i)).not.toBeInTheDocument()
    expect(window.localStorage.getItem('memory-game.last-player-name')).toBeNull()
    expect(window.localStorage.getItem('memory-game.leaderboard')).toBeNull()
  })

  it('deve exibir quadro de pontuações na tela inicial', () => {
    const view = render(<App />)
    expect(view.getByRole('region', { name: /melhores pontuações/i })).toBeInTheDocument()
  })

  it('deve ocultar quadro de pontuações durante a partida', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    expect(view.getByRole('region', { name: /melhores pontuações/i })).toBeInTheDocument()

    await user.click(view.getByRole('button', { name: DIFFICULTIES.facil.label }))
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    expect(view.queryByRole('region', { name: /melhores pontuações/i })).not.toBeInTheDocument()
  })
})
