import { expect, test, type Page } from '@playwright/test'

const INITIALIZATION_BUFFER_MS = 10_000

const startGame = async (page: Page, difficultyLabel: RegExp) => {
  await page.getByRole('button', { name: difficultyLabel }).click()
  await page.getByRole('button', { name: /iniciar partida/i }).click()

  await expect(page.getByRole('region', { name: /tabuleiro de cartas/i })).toBeVisible()
}

const finishInitialization = async (page: Page) => {
  await page.clock.fastForward(INITIALIZATION_BUFFER_MS)
  await expect(page.getByRole('button', { name: /carta/i }).first()).toBeEnabled()
}

const getPairIndicesByFace = async (page: Page): Promise<number[][]> => {
  const cards = page.getByRole('button', { name: /carta/i })
  const cardCount = await cards.count()
  const indicesByFace = new Map<string, number[]>()

  for (let index = 0; index < cardCount; index += 1) {
    const faceSrc = await cards.nth(index).locator('img').getAttribute('src')

    if (!faceSrc) {
      continue
    }

    const existing = indicesByFace.get(faceSrc) ?? []
    existing.push(index)
    indicesByFace.set(faceSrc, existing)
  }

  return [...indicesByFace.values()].filter((indices) => indices.length === 2)
}

test.describe('Jogo da Memória', () => {
  test('deve iniciar partida apos escolher dificuldade e ajustar configuracoes do jogador', async ({
    page,
  }) => {
    await page.clock.install()
    await page.goto('/')

    await expect(
      page.getByRole('button', { name: /abrir configuracoes do jogador/i }),
    ).toBeVisible()
    await page.getByRole('button', { name: /abrir configuracoes do jogador/i }).click()
    await page.getByRole('menuitemradio', { name: /escuro/i }).click()
    await page.getByRole('menuitemradio', { name: /pontos/i }).click()
    await startGame(page, /médio/i)

    await expect(page.getByText(/^Tempo restante:\s*270$/i)).toBeVisible()
    const firstCard = page.getByRole('button', { name: /carta/i }).first()
    const cards = page.getByRole('button', { name: /carta/i })
    await expect(cards).toHaveCount(36)
    await expect(firstCard).toBeVisible()
    await expect(firstCard).toBeDisabled()
    await expect(firstCard).toHaveAttribute('data-flipped', 'false')

    await page.clock.fastForward(4_000)
    await expect(firstCard).toHaveAttribute('data-flipped', 'true')

    await finishInitialization(page)
    await expect(firstCard).toHaveAttribute('data-flipped', 'false')
    const board = page.getByRole('region', { name: /tabuleiro de cartas/i })
    await expect(board.locator('[data-card-pattern="pontos"]')).toHaveCount(36)
  })

  test('deve atualizar score e resolver mismatch durante gameplay', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')

    await startGame(page, /fácil/i)
    await finishInitialization(page)

    const cards = page.getByRole('button', { name: /carta/i })
    const pairIndices = await getPairIndicesByFace(page)
    expect(pairIndices.length).toBeGreaterThanOrEqual(3)

    const matchPair = pairIndices[0]!
    const mismatchFirst = pairIndices[1]![0]
    const mismatchSecond = pairIndices[2]![0]

    await cards.nth(matchPair[0]).click()
    await cards.nth(matchPair[1]).click()

    await expect(page.getByText(/^Erros:\s*0$/i)).toBeVisible()
    await expect(page.getByText(/^Pontuação:\s*100$/i)).toBeVisible()

    await cards.nth(mismatchFirst).click()
    await cards.nth(mismatchSecond).click()

    await expect(cards.nth(mismatchFirst)).toHaveAttribute('data-flipped', 'true')
    await expect(cards.nth(mismatchSecond)).toHaveAttribute('data-flipped', 'true')

    await page.clock.fastForward(700)

    await expect(page.getByText(/^Erros:\s*1$/i)).toBeVisible()
    await expect(page.getByText(/^Pontuação:\s*85$/i)).toBeVisible()
    await expect(cards.nth(mismatchFirst)).toHaveAttribute('data-flipped', 'false')
    await expect(cards.nth(mismatchSecond)).toHaveAttribute('data-flipped', 'false')
  })

  test('deve vencer e salvar pontuacao no ranking', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')

    await startGame(page, /fácil/i)
    await finishInitialization(page)

    const cards = page.getByRole('button', { name: /carta/i })
    const pairIndices = await getPairIndicesByFace(page)

    for (const [firstIndex, secondIndex] of pairIndices) {
      await cards.nth(firstIndex).click()
      await cards.nth(secondIndex).click()
    }

    await expect(page.getByRole('dialog', { name: /você venceu/i })).toBeVisible()
    await page.getByLabel(/seu nome/i).fill('E2E Player')
    await page.getByRole('button', { name: /salvar pontuação/i }).click()

    await expect(page.getByRole('dialog', { name: /você venceu/i })).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /^você venceu$/i })).toBeVisible()
    await expect(page.getByRole('region', { name: /quadro de melhores pontuações/i })).toBeVisible()

    const storageData = await page.evaluate(() => {
      return {
        lastPlayerName: window.localStorage.getItem('memory-game.last-player-name'),
        leaderboard: window.localStorage.getItem('memory-game.leaderboard'),
      }
    })

    expect(storageData.lastPlayerName).toBe('E2E Player')
    expect(storageData.leaderboard).toContain('E2E Player')
  })

  test('deve exibir derrota quando o tempo acabar', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')

    await startGame(page, /fácil/i)
    await finishInitialization(page)

    // Avança o relógio em passos de 1s para reduzir sensibilidade ao instante
    // em que o intervalo de TICK é registrado na fase de jogo.
    const gameOverHeading = page.getByRole('heading', { name: /tempo esgotado/i })
    for (let second = 0; second < 180; second += 1) {
      if ((await gameOverHeading.count()) > 0) {
        break
      }

      await page.clock.fastForward(1_000)
    }

    await expect(gameOverHeading).toBeVisible()
    await expect(page.getByRole('button', { name: /jogar novamente/i })).toBeVisible()
  })
})
