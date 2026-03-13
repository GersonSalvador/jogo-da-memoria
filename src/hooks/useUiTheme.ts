import { useEffect, useMemo, useState } from 'react'
import { UI_THEMES, type UiThemeKey } from '../services/gameConfig.ts'

const STORAGE_KEY = 'memory-game.ui-theme'

const getInitialTheme = (): UiThemeKey => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY) as UiThemeKey | null
  if (storedTheme && storedTheme in UI_THEMES) {
    return storedTheme
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
  }

  return 'claro'
}

export const useUiTheme = () => {
  const [uiTheme, setUiTheme] = useState<UiThemeKey>(getInitialTheme)
  const themeKeys = useMemo(() => Object.keys(UI_THEMES) as UiThemeKey[], [])

  useEffect(() => {
    document.documentElement.dataset.uiTheme = uiTheme
    window.localStorage.setItem(STORAGE_KEY, uiTheme)
  }, [uiTheme])

  const cycleUiTheme = () => {
    setUiTheme((currentTheme) => {
      const currentIndex = themeKeys.indexOf(currentTheme)
      const nextIndex = (currentIndex + 1) % themeKeys.length
      return themeKeys[nextIndex]!
    })
  }

  const currentIndex = themeKeys.indexOf(uiTheme)
  const nextTheme = themeKeys[(currentIndex + 1) % themeKeys.length]!

  const selectUiTheme = (theme: UiThemeKey) => {
    setUiTheme(theme)
  }

  return {
    uiTheme,
    uiThemes: UI_THEMES,
    nextTheme,
    cycleUiTheme,
    selectUiTheme,
  }
}
