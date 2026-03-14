import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('freesound service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('deve usar fallback CDN quando nao houver token da API', async () => {
    vi.stubEnv('VITE_FREESOUND_API_TOKEN', '')

    const { resolveSoundUrl } = await import('./freesound.ts')
    const url = await resolveSoundUrl('gameStart')

    expect(url).toBe('https://cdn.freesound.org/previews/445/445031_6243287-lq.mp3')
  })

  it('deve usar URL da API quando token existir e a resposta tiver preview', async () => {
    vi.stubEnv('VITE_FREESOUND_API_TOKEN', 'token-valido')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        previews: {
          'preview-lq-mp3': 'https://cdn.freesound.org/previews/custom/audio.mp3',
        },
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { resolveSoundUrl } = await import('./freesound.ts')
    const url = await resolveSoundUrl('buttonClick')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(url).toBe('https://cdn.freesound.org/previews/custom/audio.mp3')
  })
})
