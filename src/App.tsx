import { useUiTheme } from './hooks/useUiTheme.ts'
import { MemoryGamePage } from './pages/MemoryGamePage.tsx'

const App = () => {
  const { uiTheme, uiThemes, selectUiTheme } = useUiTheme()

  return <MemoryGamePage uiTheme={uiTheme} uiThemes={uiThemes} onSelectUiTheme={selectUiTheme} />
}

export default App
