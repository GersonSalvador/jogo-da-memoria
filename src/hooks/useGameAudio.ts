import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALL_SOUND_EVENTS,
  CONFIGURABLE_SOUND_EVENTS,
  type GameSoundEvent,
  getSoundCooldownMs,
  getSoundVolume,
  resolveSoundUrl,
} from '../services/freesound.ts'

const AUDIO_ENABLED_STORAGE_KEY = 'memory-game.audio-enabled'
const AUDIO_EVENT_SETTINGS_STORAGE_KEY = 'memory-game.audio-event-settings'

const DEFAULT_EVENT_SETTINGS: Record<GameSoundEvent, boolean> = {
  gameStart: true,
  cardFlipUp: true,
  cardFlipDown: true,
  gameWon: true,
  gameLost: true,
  pairMatched: true,
  countdownTick: true,
  buttonClick: false,
  scoreHighlight: true,
}

type PlaySoundOptions = {
  restart?: boolean
  startAtSeconds?: number
}

const getInitialAudioEnabled = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }

  const storedValue = window.localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY)
  if (storedValue === null) {
    return true
  }

  return storedValue === 'true'
}

const getInitialAudioEventSettings = (): Record<GameSoundEvent, boolean> => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_EVENT_SETTINGS }
  }

  const storedValue = window.localStorage.getItem(AUDIO_EVENT_SETTINGS_STORAGE_KEY)
  if (!storedValue) {
    return { ...DEFAULT_EVENT_SETTINGS }
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<Record<GameSoundEvent, unknown>>
    const mergedSettings = { ...DEFAULT_EVENT_SETTINGS }

    for (const event of CONFIGURABLE_SOUND_EVENTS) {
      if (typeof parsed[event] === 'boolean') {
        mergedSettings[event] = parsed[event]
      }
    }

    return mergedSettings
  } catch {
    return { ...DEFAULT_EVENT_SETTINGS }
  }
}

export const useGameAudio = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(getInitialAudioEnabled)
  const [audioEventSettings, setAudioEventSettings] = useState<Record<GameSoundEvent, boolean>>(
    getInitialAudioEventSettings,
  )
  const audioElementsRef = useRef<Partial<Record<GameSoundEvent, HTMLAudioElement>>>({})
  const audioPreloadPromisesRef = useRef<
    Partial<Record<GameSoundEvent, Promise<HTMLAudioElement | null>>>
  >({})
  const lastPlayedAtRef = useRef<Partial<Record<GameSoundEvent, number>>>({})
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(isAudioEnabled))
  }, [isAudioEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      AUDIO_EVENT_SETTINGS_STORAGE_KEY,
      JSON.stringify(audioEventSettings),
    )
  }, [audioEventSettings])

  useEffect(() => {
    isUnmountedRef.current = false

    return () => {
      isUnmountedRef.current = true
      const audioEntries = Object.values(audioElementsRef.current)
      for (const element of audioEntries) {
        if (!element) {
          continue
        }
        element.pause()
        element.src = ''
      }
      audioElementsRef.current = {}
      audioPreloadPromisesRef.current = {}
    }
  }, [])

  const preloadSound = useMemo(() => {
    return (event: GameSoundEvent): Promise<HTMLAudioElement | null> => {
      if (typeof Audio === 'undefined') {
        return Promise.resolve(null)
      }

      const cachedAudio = audioElementsRef.current[event]
      if (cachedAudio) {
        return Promise.resolve(cachedAudio)
      }

      const inFlightPreload = audioPreloadPromisesRef.current[event]
      if (inFlightPreload) {
        return inFlightPreload
      }

      const preloadPromise = (async () => {
        const audioSource = await resolveSoundUrl(event)
        if (isUnmountedRef.current) {
          return null
        }

        let audio = audioElementsRef.current[event]

        if (!audio) {
          audio = new Audio(audioSource)
          audio.preload = 'auto'
          audioElementsRef.current[event] = audio
        } else if (audio.src !== audioSource) {
          audio.src = audioSource
        }

        audio.volume = getSoundVolume(event)
        audio.load()

        return audio
      })()

      audioPreloadPromisesRef.current[event] = preloadPromise
      void preloadPromise.finally(() => {
        if (audioPreloadPromisesRef.current[event] === preloadPromise) {
          delete audioPreloadPromisesRef.current[event]
        }
      })

      return preloadPromise
    }
  }, [])

  useEffect(() => {
    void Promise.allSettled(ALL_SOUND_EVENTS.map((event) => preloadSound(event)))
  }, [preloadSound])

  const playSound = useMemo(() => {
    return (event: GameSoundEvent, options?: PlaySoundOptions) => {
      if (!isAudioEnabled || !audioEventSettings[event] || typeof Audio === 'undefined') {
        return
      }

      const now = Date.now()
      const cooldownMs = getSoundCooldownMs(event)
      const lastPlayedAt = lastPlayedAtRef.current[event] ?? 0

      if (cooldownMs > 0 && now - lastPlayedAt < cooldownMs) {
        return
      }

      lastPlayedAtRef.current[event] = now

      void (async () => {
        const audio = await preloadSound(event)

        if (!audio || isUnmountedRef.current) {
          return
        }

        audio.volume = getSoundVolume(event)

        if (typeof options?.startAtSeconds === 'number' && options.startAtSeconds >= 0) {
          audio.currentTime = options.startAtSeconds
        } else if (options?.restart !== false) {
          audio.currentTime = 0
        }

        try {
          await audio.play()
        } catch {
          // Browser can block autoplay if the tab has not received user interaction yet.
        }
      })()
    }
  }, [audioEventSettings, isAudioEnabled, preloadSound])

  const toggleAudio = () => {
    setIsAudioEnabled((isEnabled) => {
      const nextEnabled = !isEnabled
      if (!nextEnabled) {
        const audioEntries = Object.values(audioElementsRef.current)
        for (const element of audioEntries) {
          if (!element) {
            continue
          }
          element.pause()
          element.currentTime = 0
        }
      }
      return nextEnabled
    })
  }

  const toggleSoundEvent = (event: GameSoundEvent) => {
    setAudioEventSettings((settings) => ({
      ...settings,
      [event]: !settings[event],
    }))
  }

  return {
    isAudioEnabled,
    audioEventSettings,
    playSound,
    toggleAudio,
    toggleSoundEvent,
  }
}
