import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import App from './App'

vi.mock('./services/memoryDeck.ts', async () => {
  const actual = await vi.importActual<typeof import('./services/memoryDeck.ts')>(
    './services/memoryDeck.ts',
  )

  return {
    ...actual,
    createDeck: ({ totalCards }: { totalCards: number }) => {
      const totalPairs = totalCards / 2
      const deck: actual.MemoryCard[] = []

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

  it('deve renderizar tela inicial com dificuldade e botao de tema global', () => {
    const view = render(<App />)

    expect(view.getByRole('heading', { name: /jogo da memória/i })).toBeInTheDocument()
    expect(view.getByRole('combobox', { name: /dificuldade/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /alternar tema/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /iniciar partida/i })).toBeInTheDocument()
  })

  it('deve alternar tema global e persistir no localStorage', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    const toggleThemeButton = view.getByRole('button', { name: /alternar tema/i })

    expect(document.documentElement.dataset.uiTheme).toBe('claro')

    await user.click(toggleThemeButton)
    expect(document.documentElement.dataset.uiTheme).toBe('escuro')

    await user.click(toggleThemeButton)
    expect(document.documentElement.dataset.uiTheme).toBe('sepia')

    expect(window.localStorage.getItem('memory-game.ui-theme')).toBe('sepia')
  })

  it('deve iniciar partida com dificuldade escolhida e exibir grid de cartas', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'medio')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    expect(view.getByText(/tempo restante:/i)).toHaveTextContent('150')
    expect(view.getByText(/erros:/i)).toHaveTextContent('0')
    expect(view.getByText(/pontuação:/i)).toHaveTextContent('0')

    const board = view.getByRole('grid', { name: /tabuleiro de cartas/i })
    expect(board).toBeInTheDocument()
    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards).toHaveLength(12)
  })

  it('deve atualizar erros e pontuação quando jogador erra um par', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards.length).toBeGreaterThanOrEqual(3)

    await user.click(cards[0]!)
    await user.click(cards[2]!)

    expect(view.getByText(/erros:/i)).toHaveTextContent('1')
    expect(view.getByText(/pontuação:/i)).toHaveTextContent('-15')
  })

  it('deve encerrar com derrota quando o tempo chegar a zero', async () => {
    vi.useFakeTimers()
    const view = render(<App />)

    fireEvent.change(view.getByRole('combobox', { name: /dificuldade/i }), {
      target: { value: 'facil' },
    })
    fireEvent.click(view.getByRole('button', { name: /iniciar partida/i }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000)
    })

    expect(view.getByRole('heading', { name: /tempo esgotado/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /jogar novamente/i })).toBeInTheDocument()
  })

  it('deve encerrar com vitória e exibir pontuação final', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    expect(cards.length % 2).toBe(0)

    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index]!)
      await user.click(cards[index + 1]!)
    }

    expect(view.getByRole('dialog', { name: /você venceu/i })).toBeInTheDocument()
    expect(view.getByLabelText(/seu nome/i)).toBeInTheDocument()
  })

  it('deve pré-preencher o campo de nome com o último nome salvo', async () => {
    window.localStorage.setItem('memory-game.last-player-name', 'Fulano')

    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index]!)
      await user.click(cards[index + 1]!)
    }

    expect(view.getByLabelText(/seu nome/i)).toHaveValue('Fulano')
  })

  it('botão salvar deve estar desabilitado quando nome está vazio', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index]!)
      await user.click(cards[index + 1]!)
    }

    const nameInput = view.getByLabelText(/seu nome/i)
    await user.clear(nameInput)

    const saveButton = view.getByRole('button', { name: /salvar pontuação/i })
    expect(saveButton).toBeDisabled()
  })

  it('deve salvar pontuação no ranking e fechar modal ao confirmar nome', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index]!)
      await user.click(cards[index + 1]!)
    }

    const nameInput = view.getByLabelText(/seu nome/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jogador Teste')
    await user.click(view.getByRole('button', { name: /salvar pontuação/i }))

    expect(view.queryByRole('dialog', { name: /você venceu/i })).not.toBeInTheDocument()
    expect(view.getByRole('heading', { name: /você venceu/i })).toBeInTheDocument()
    expect(view.getByText(/melhores pontuações/i)).toBeInTheDocument()
    expect(window.localStorage.getItem('memory-game.last-player-name')).toBe('Jogador Teste')
  })

  it('deve fechar modal sem salvar ao clicar em Pular', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    const cards = view.getAllByRole('button', { name: /carta/i })
    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index]!)
      await user.click(cards[index + 1]!)
    }

    await user.click(view.getByRole('button', { name: /pular/i }))
    expect(view.queryByRole('dialog', { name: /você venceu/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('memory-game.last-player-name')).toBeNull()
  })

  it('deve exibir quadro de pontuações na tela inicial', () => {
    const view = render(<App />)
    expect(view.getByRole('region', { name: /melhores pontuações/i })).toBeInTheDocument()
  })

  it('deve ocultar quadro de pontuações durante a partida', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    expect(view.getByRole('region', { name: /melhores pontuações/i })).toBeInTheDocument()

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    expect(view.queryByRole('region', { name: /melhores pontuações/i })).not.toBeInTheDocument()
  })
})
