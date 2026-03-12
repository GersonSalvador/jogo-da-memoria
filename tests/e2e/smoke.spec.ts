import { expect, test } from '@playwright/test'

test('renderiza tela inicial', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Get started' })).toBeVisible()
})
