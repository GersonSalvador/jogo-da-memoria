import { expect, test } from '@playwright/test'

test.describe('Jogo da Memória', () => {
  test('deve iniciar partida apos escolher dificuldade e ajustar configuracoes do jogador', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByRole('button', { name: /abrir configuracoes do jogador/i }),
    ).toBeVisible()
    await page.getByRole('button', { name: /abrir configuracoes do jogador/i }).click()
    await page.getByRole('menuitemradio', { name: /escuro/i }).click()
    await page.getByRole('menuitemradio', { name: /pontos/i }).click()
    await page.getByRole('button', { name: /médio/i }).click()
    await page.getByRole('button', { name: /iniciar partida/i }).click()

    await expect(page.getByText(/tempo restante:/i)).toContainText('270')
    await expect(page.getByRole('region', { name: /tabuleiro de cartas/i })).toBeVisible()
    const firstCard = page.getByRole('button', { name: /carta/i }).first()
    await expect(firstCard).toBeVisible()
    await expect(firstCard).toBeDisabled()
    await expect(firstCard).toHaveAttribute('data-flipped', 'false')

    await expect(firstCard).toHaveAttribute('data-flipped', 'true', { timeout: 4_000 })
    await expect(firstCard).toHaveAttribute('data-flipped', 'true')

    await expect(firstCard).toBeEnabled({ timeout: 6_000 })
    await expect(firstCard).toHaveAttribute('data-flipped', 'false')
    await expect(page.locator('[data-card-pattern="pontos"]').first()).toBeVisible()
  })

  test('deve exibir derrota quando o tempo acabar', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /fácil/i }).click()
    await page.getByRole('button', { name: /iniciar partida/i }).click()

    await page.waitForTimeout(121_000)

    await expect(page.getByRole('heading', { name: /tempo esgotado/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /jogar novamente/i })).toBeVisible()
  })
})
