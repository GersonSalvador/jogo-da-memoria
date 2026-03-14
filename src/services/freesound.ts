export type GameSoundEvent =
  | 'gameStart'
  | 'cardFlipUp'
  | 'cardFlipDown'
  | 'gameWon'
  | 'gameLost'
  | 'pairMatched'
  | 'countdownTick'
  | 'buttonClick'

export const CONFIGURABLE_SOUND_EVENTS: GameSoundEvent[] = [
  'gameStart',
  'cardFlipUp',
  'cardFlipDown',
  'pairMatched',
  'countdownTick',
  'gameWon',
  'gameLost',
]

export const SOUND_EVENT_LABELS: Record<GameSoundEvent, string> = {
  gameStart: 'Início da partida',
  cardFlipUp: 'Virar carta para cima',
  cardFlipDown: 'Virar carta para baixo',
  pairMatched: 'Par correto',
  countdownTick: 'Contagem regressiva final',
  gameWon: 'Vitória',
  gameLost: 'Derrota',
  buttonClick: 'Clique em botão',
}

type SoundDescriptor = {
  id: number
  ownerId: number
  fallbackFormat: 'mp3' | 'ogg'
  volume: number
  cooldownMs?: number
}

type FreesoundApiSound = {
  previews?: Partial<
    Record<'preview-hq-mp3' | 'preview-lq-mp3' | 'preview-hq-ogg' | 'preview-lq-ogg', string>
  >
}

const FREESOUND_API_BASE_URL = 'https://freesound.org/apiv2'
const FREESOUND_API_TOKEN = import.meta.env.VITE_FREESOUND_API_TOKEN?.trim() ?? ''

const SOUND_LIBRARY: Record<GameSoundEvent, SoundDescriptor> = {
  gameStart: {
    id: 445031,
    ownerId: 6243287,
    fallbackFormat: 'mp3',
    volume: 0.45,
    cooldownMs: 400,
  },
  cardFlipUp: {
    id: 240776,
    ownerId: 4107740,
    fallbackFormat: 'mp3',
    volume: 0.5,
    cooldownMs: 40,
  },
  cardFlipDown: {
    id: 240776,
    ownerId: 4107740,
    fallbackFormat: 'mp3',
    volume: 0.5,
    cooldownMs: 120,
  },
  gameWon: {
    id: 588234,
    ownerId: 8646358,
    fallbackFormat: 'mp3',
    volume: 0.6,
  },
  gameLost: {
    id: 533034,
    ownerId: 6299573,
    fallbackFormat: 'mp3',
    volume: 0.5,
  },
  pairMatched: {
    id: 240776,
    ownerId: 4107740,
    fallbackFormat: 'mp3',
    volume: 0.4,
    cooldownMs: 80,
  },
  countdownTick: {
    id: 97879,
    ownerId: 321967,
    fallbackFormat: 'mp3',
    volume: 0.55,
    cooldownMs: 750,
  },
  buttonClick: {
    id: 448086,
    ownerId: 9159316,
    fallbackFormat: 'mp3',
    volume: 0.35,
    cooldownMs: 80,
  },
}

const soundUrlCache = new Map<GameSoundEvent, Promise<string>>()

const buildCdnPreviewUrl = (descriptor: SoundDescriptor): string => {
  const bucket = String(descriptor.id).slice(0, 3)
  const quality = 'lq'

  return `https://cdn.freesound.org/previews/${bucket}/${descriptor.id}_${descriptor.ownerId}-${quality}.${descriptor.fallbackFormat}`
}

const fetchFreesoundPreviewUrl = async (descriptor: SoundDescriptor): Promise<string> => {
  if (!FREESOUND_API_TOKEN) {
    return buildCdnPreviewUrl(descriptor)
  }

  const response = await fetch(
    `${FREESOUND_API_BASE_URL}/sounds/${descriptor.id}/?token=${encodeURIComponent(FREESOUND_API_TOKEN)}&fields=previews`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Freesound API request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as FreesoundApiSound
  const previews = payload.previews

  if (!previews) {
    throw new Error('Freesound API response did not include previews')
  }

  const preferredUrl =
    previews['preview-lq-mp3'] ??
    previews['preview-hq-mp3'] ??
    previews['preview-lq-ogg'] ??
    previews['preview-hq-ogg']

  if (!preferredUrl) {
    throw new Error('Freesound API response did not include a playable preview URL')
  }

  return preferredUrl
}

export const resolveSoundUrl = (event: GameSoundEvent): Promise<string> => {
  const cached = soundUrlCache.get(event)
  if (cached) {
    return cached
  }

  const descriptor = SOUND_LIBRARY[event]

  const urlPromise = fetchFreesoundPreviewUrl(descriptor).catch(() => {
    return buildCdnPreviewUrl(descriptor)
  })

  soundUrlCache.set(event, urlPromise)

  return urlPromise
}

export const getSoundVolume = (event: GameSoundEvent): number => {
  return SOUND_LIBRARY[event].volume
}

export const getSoundCooldownMs = (event: GameSoundEvent): number => {
  return SOUND_LIBRARY[event].cooldownMs ?? 0
}
