import { createAvatar, type Style } from '@dicebear/core'
import * as botttsStyle from '@dicebear/bottts'

type GenericStyle = Style<Record<string, unknown>>

type GenerateFaceInput = {
  seed: string
}

export const generateFace = ({ seed }: GenerateFaceInput): string => {
  const avatar = createAvatar(botttsStyle as GenericStyle, { seed })
  return avatar.toDataUri()
}
