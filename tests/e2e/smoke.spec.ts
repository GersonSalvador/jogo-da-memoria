import { expect, test } from '@playwright/test'

test('carrega aplicacao e inicia partida basica', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /jogo da memória/i })).toBeVisible()
  await page.getByRole('button', { name: /fácil/i }).click()
  await page.getByRole('button', { name: /iniciar partida/i }).click()
  await expect(page.getByRole('region', { name: /tabuleiro de cartas/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /carta/i }).first()).toBeVisible()
})
