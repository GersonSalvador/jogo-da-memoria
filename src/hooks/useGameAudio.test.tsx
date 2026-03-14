import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ALL_SOUND_EVENTS } from '../services/freesound.ts'
import { useGameAudio } from './useGameAudio.ts'

const resolveSoundUrlMock = vi.fn<(event: string) => Promise<string>>()

vi.mock('../services/freesound.ts', async () => {
  const actual = await vi.importActual<typeof import('../services/freesound.ts')>(
    '../services/freesound.ts',
  )

  return {
    ...actual,
    resolveSoundUrl: resolveSoundUrlMock,
  }
})

class AudioMock {
  public currentTime = 0
  public preload = 'none'
  public src: string
  public volume = 1

  public static instances: AudioMock[] = []

  constructor(src: string) {
    this.src = src
    AudioMock.instances.push(this)
  }

  load = vi.fn()
  pause = vi.fn()
  play = vi.fn().mockResolvedValue(undefined)
}

describe('useGameAudio', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resolveSoundUrlMock.mockReset()
    resolveSoundUrlMock.mockImplementation(async (event) => `https://audio.test/${event}.mp3`)
    AudioMock.instances = []
    vi.stubGlobal('Audio', AudioMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deve pré-carregar todos os sons ao montar o hook', async () => {
    renderHook(() => useGameAudio())

    await waitFor(() => {
      expect(resolveSoundUrlMock).toHaveBeenCalledTimes(ALL_SOUND_EVENTS.length)
      expect(AudioMock.instances).toHaveLength(ALL_SOUND_EVENTS.length)
    })

    expect(resolveSoundUrlMock.mock.calls.map(([event]) => event)).toEqual(ALL_SOUND_EVENTS)

    for (const audio of AudioMock.instances) {
      expect(audio.preload).toBe('auto')
      expect(audio.load).toHaveBeenCalledTimes(1)
      expect(audio.play).not.toHaveBeenCalled()
    }
  })
})