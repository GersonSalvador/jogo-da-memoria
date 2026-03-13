import { useUiTheme } from './hooks/useUiTheme.ts'
import { MemoryGamePage } from './pages/MemoryGamePage.tsx'

const App = () => {
  const { uiTheme, uiThemes, nextTheme, cycleUiTheme, selectUiTheme } = useUiTheme()

  return (
    <MemoryGamePage
      uiTheme={uiTheme}
      uiThemes={uiThemes}
      currentThemeLabel={uiThemes[uiTheme].label}
      nextTheme={nextTheme}
      nextThemeLabel={uiThemes[nextTheme].label}
      onCycleUiTheme={cycleUiTheme}
      onSelectUiTheme={selectUiTheme}
    />
  )
}

export default App
