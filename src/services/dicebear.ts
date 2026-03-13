import { createAvatar, type Style } from '@dicebear/core'
import * as avataaarsStyle from '@dicebear/avataaars'
import * as botttsStyle from '@dicebear/bottts'
import * as pixelArtStyle from '@dicebear/pixel-art'
import type { ThemeKey } from './gameConfig'

type GenericStyle = Style<Record<string, unknown>>

const themeStyleMap: Record<ThemeKey, GenericStyle> = {
  avataaars: avataaarsStyle as GenericStyle,
  bottts: botttsStyle as GenericStyle,
  'pixel-art': pixelArtStyle as GenericStyle,
}

type GenerateFaceInput = {
  seed: string
  theme: ThemeKey
}

export const generateFace = ({ seed, theme }: GenerateFaceInput): string => {
  const avatar = createAvatar(themeStyleMap[theme], { seed })
  return avatar.toDataUri()
}
