import { expect, test } from '@playwright/test'

test.describe('Jogo da Memória', () => {
  test('deve iniciar partida após escolher dificuldade e tema', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('combobox', { name: /dificuldade/i }).selectOption('medio')
    await page.getByRole('combobox', { name: /tema/i }).selectOption('bottts')
    await page.getByRole('button', { name: /iniciar partida/i }).click()

    await expect(page.getByText(/tempo restante:/i)).toContainText('150')
    await expect(page.getByRole('grid', { name: /tabuleiro de cartas/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /carta/i }).first()).toBeVisible()
  })

  test('deve exibir derrota quando o tempo acabar', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('combobox', { name: /dificuldade/i }).selectOption('facil')
    await page.getByRole('button', { name: /iniciar partida/i }).click()

    await page.waitForTimeout(121_000)

    await expect(page.getByRole('heading', { name: /tempo esgotado/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /jogar novamente/i })).toBeVisible()
  })
})
