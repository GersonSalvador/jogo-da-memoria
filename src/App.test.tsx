import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

describe('Jogo da Memória - integração de UI', () => {
  it('deve renderizar tela inicial com seleção de dificuldade e tema', () => {
    const view = render(<App />)

    expect(view.getByRole('heading', { name: /jogo da memória/i })).toBeInTheDocument()
    expect(view.getByRole('combobox', { name: /dificuldade/i })).toBeInTheDocument()
    expect(view.getByRole('combobox', { name: /tema/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /iniciar partida/i })).toBeInTheDocument()
  })

  it('deve iniciar partida com configuração escolhida e exibir grid de cartas', async () => {
    const user = userEvent.setup()
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'medio')
    await user.selectOptions(view.getByRole('combobox', { name: /tema/i }), 'pixel-art')
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
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const view = render(<App />)

    await user.selectOptions(view.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(view.getByRole('button', { name: /iniciar partida/i }))

    vi.advanceTimersByTime(120_000)

    expect(view.getByRole('heading', { name: /tempo esgotado/i })).toBeInTheDocument()
    expect(view.getByRole('button', { name: /jogar novamente/i })).toBeInTheDocument()

    vi.useRealTimers()
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

    expect(view.getByRole('heading', { name: /você venceu/i })).toBeInTheDocument()
    expect(view.getByText(/pontuação final:/i)).toBeInTheDocument()
  })
})
