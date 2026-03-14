import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ALL_SOUND_EVENTS } from '../services/freesound.ts'
import { useGameAudio } from './useGameAudio.ts'

const { resolveSoundUrlMock } = vi.hoisted(() => ({
  resolveSoundUrlMock: vi.fn<(event: string) => Promise<string>>(),
}))

vi.mock('../services/freesound.ts', async () => {
  const actual = (await vi.importActual('../services/freesound.ts')) as Record<string, unknown>

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

  it('deve reproduzir o som respeitando startAtSeconds e cooldown do evento', async () => {
    const dateNowSpy = vi.spyOn(Date, 'now')
    const { result } = renderHook(() => useGameAudio())

    await waitFor(() => {
      expect(AudioMock.instances).toHaveLength(ALL_SOUND_EVENTS.length)
    })

    const cardFlipDownAudio = AudioMock.instances.find(
      (audio) => audio.src === 'https://audio.test/cardFlipDown.mp3',
    )

    expect(cardFlipDownAudio).toBeDefined()

    dateNowSpy.mockReturnValue(1_000)
    act(() => {
      result.current.playSound('cardFlipDown', { startAtSeconds: 1.5 })
    })

    await waitFor(() => {
      expect(cardFlipDownAudio?.play).toHaveBeenCalledTimes(1)
    })

    expect(cardFlipDownAudio?.currentTime).toBe(1.5)

    dateNowSpy.mockReturnValue(1_050)
    act(() => {
      result.current.playSound('cardFlipDown')
    })

    await waitFor(() => {
      expect(cardFlipDownAudio?.play).toHaveBeenCalledTimes(1)
    })

    dateNowSpy.mockRestore()
  })

  it('deve pausar e resetar os áudios ao desligar o som e limpar recursos no unmount', async () => {
    const { result, unmount } = renderHook(() => useGameAudio())

    await waitFor(() => {
      expect(AudioMock.instances).toHaveLength(ALL_SOUND_EVENTS.length)
    })

    const gameWonAudio = AudioMock.instances.find(
      (audio) => audio.src === 'https://audio.test/gameWon.mp3',
    )

    expect(gameWonAudio).toBeDefined()

    if (!gameWonAudio) {
      return
    }

    gameWonAudio.currentTime = 8

    act(() => {
      result.current.toggleAudio()
    })

    expect(result.current.isAudioEnabled).toBe(false)
    expect(window.localStorage.getItem('memory-game.audio-enabled')).toBe('false')
    expect(gameWonAudio.pause).toHaveBeenCalledTimes(1)
    expect(gameWonAudio.currentTime).toBe(0)

    unmount()

    expect(gameWonAudio.pause).toHaveBeenCalledTimes(2)
    expect(gameWonAudio.src).toBe('')
  })
})
