import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'

describe('Jogo da Memória - integração de UI', () => {
  it('deve renderizar tela inicial com seleção de dificuldade e tema', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jogo da memória/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /dificuldade/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /tema/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar partida/i })).toBeInTheDocument()
  })

  it('deve iniciar partida com configuração escolhida e exibir grid de cartas', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: /dificuldade/i }), 'medio')
    await user.selectOptions(screen.getByRole('combobox', { name: /tema/i }), 'pixel-art')
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }))

    expect(screen.getByText(/tempo restante:/i)).toHaveTextContent('150')
    expect(screen.getByText(/erros:/i)).toHaveTextContent('0')
    expect(screen.getByText(/pontuação:/i)).toHaveTextContent('0')

    const board = screen.getByRole('grid', { name: /tabuleiro de cartas/i })
    const cards = within(board).getAllByRole('button', { name: /carta/i })
    expect(cards).toHaveLength(12)
  })

  it('deve atualizar erros e pontuação quando jogador erra um par', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }))

    const board = screen.getByRole('grid', { name: /tabuleiro de cartas/i })
    const cards = within(board).getAllByRole('button', { name: /carta/i })

    await user.click(cards[0])
    await user.click(cards[1])

    expect(screen.getByText(/erros:/i)).toHaveTextContent('1')
    expect(screen.getByText(/pontuação:/i)).toHaveTextContent('-15')
  })

  it('deve encerrar com derrota quando o tempo chegar a zero', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }))

    vi.advanceTimersByTime(120_000)

    expect(screen.getByRole('heading', { name: /tempo esgotado/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jogar novamente/i })).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('deve encerrar com vitória e exibir pontuação final', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByRole('combobox', { name: /dificuldade/i }), 'facil')
    await user.click(screen.getByRole('button', { name: /iniciar partida/i }))

    const board = screen.getByRole('grid', { name: /tabuleiro de cartas/i })
    const cards = within(board).getAllByRole('button', { name: /carta/i })

    for (let index = 0; index < cards.length; index += 2) {
      await user.click(cards[index])
      await user.click(cards[index + 1])
    }

    expect(screen.getByRole('heading', { name: /você venceu/i })).toBeInTheDocument()
    expect(screen.getByText(/pontuação final:/i)).toBeInTheDocument()
  })
})
