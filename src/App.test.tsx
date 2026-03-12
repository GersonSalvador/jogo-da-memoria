import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('deve renderizar o título inicial', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /get started/i })).toBeInTheDocument()
  })
})
