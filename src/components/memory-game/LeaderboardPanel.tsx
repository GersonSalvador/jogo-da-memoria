import { useState } from 'react'
import { DIFFICULTIES, type DifficultyKey } from '../../services/gameConfig.ts'
import type { LeaderboardEntry } from '../../types/leaderboard.ts'
import styles from './LeaderboardPanel.module.scss'

type Tab = 'geral' | DifficultyKey

const ALL_TABS: { key: Tab; label: string }[] = [
  { key: 'geral', label: 'Geral' },
  ...(Object.entries(DIFFICULTIES) as [DifficultyKey, { label: string }][]).map(
    ([key, { label }]) => ({ key, label }),
  ),
]

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

type EntryRowProps = {
  entry: LeaderboardEntry
  position: number
  showDifficulty: boolean
}

const EntryRow = ({ entry, position, showDifficulty }: EntryRowProps) => (
  <tr className={styles.row}>
    <td className={styles.position} aria-label={`Posição ${position}`}>
      {position}
    </td>
    <td className={styles.playerName}>{entry.playerName}</td>
    <td className={styles.score}>{entry.score.toLocaleString('pt-BR')}</td>
    {showDifficulty && (
      <td className={styles.difficulty}>{DIFFICULTIES[entry.difficulty].label}</td>
    )}
    <td className={styles.date}>{formatDate(entry.timestamp)}</td>
  </tr>
)

type LeaderboardPanelProps = {
  topOverall: LeaderboardEntry[]
  getTopForDifficulty: (difficulty: DifficultyKey) => LeaderboardEntry[]
}

export const LeaderboardPanel = ({ topOverall, getTopForDifficulty }: LeaderboardPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('geral')

  const entries: LeaderboardEntry[] =
    activeTab === 'geral' ? topOverall : getTopForDifficulty(activeTab)

  const showDifficulty = activeTab === 'geral'

  return (
    <section className={styles.panel} aria-label="Quadro de melhores pontuações">
      <h2 className={styles.title}>Melhores Pontuações</h2>

      <div className={styles.tabs} role="tablist" aria-label="Filtrar por modo">
        {ALL_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            id={`tab-${key}`}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className={styles.tabPanel}
      >
        {entries.length === 0 ? (
          <p className={styles.empty}>Nenhuma pontuação registrada ainda.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.position}>
                  #
                </th>
                <th scope="col" className={styles.playerName}>
                  Jogador
                </th>
                <th scope="col" className={styles.score}>
                  Pontuação
                </th>
                {showDifficulty && (
                  <th scope="col" className={styles.difficulty}>
                    Modo
                  </th>
                )}
                <th scope="col" className={styles.date}>
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  position={index + 1}
                  showDifficulty={showDifficulty}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
