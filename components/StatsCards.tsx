import type { TaskStats } from '@/lib/tasks'

type StatsCardsProps = {
  stats: TaskStats
}

const statsConfig = [
  { key: 'total', label: 'Total' },
  { key: 'completed', label: 'Concluidas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'completionRate', label: 'Taxa de conclusao' },
] as const

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="stats-grid">
      {statsConfig.map(({ key, label }) => (
        <article className="stat-card" key={key}>
          <p>{label}</p>
          <strong>{key === 'completionRate' ? `${stats[key]}%` : stats[key]}</strong>
        </article>
      ))}
    </div>
  )
}
