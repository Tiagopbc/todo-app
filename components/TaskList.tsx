import type { Task } from '@/lib/tasks'

type TaskListProps = {
  tasks: Task[]
  isMutating: boolean
  onToggleTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}

export default function TaskList({
  tasks,
  isMutating,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <p>Nenhuma tarefa cadastrada ainda.</p>
  }

  return (
    <ul
      style={{
        display: 'grid',
        gap: 12,
        listStyle: 'none',
        padding: 0,
      }}
    >
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
            }}
          >
            <input
              checked={task.done}
              disabled={isMutating}
              onChange={() => onToggleTask(task)}
              type="checkbox"
            />
            <span
              style={{
                textDecoration: task.done ? 'line-through' : 'none',
                color: task.done ? '#6b7280' : 'inherit',
              }}
            >
              {task.title}
            </span>
          </label>

          <button
            disabled={isMutating}
            onClick={() => onDeleteTask(task)}
            style={{
              background: '#111827',
              border: 0,
              borderRadius: 999,
              color: '#fff',
              cursor: 'pointer',
              padding: '8px 12px',
            }}
            type="button"
          >
            Excluir
          </button>
        </li>
      ))}
    </ul>
  )
}
