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
    return <p className="empty-state">Nenhuma tarefa cadastrada ainda. Adicione a primeira para comecar.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li className={task.done ? 'task-item task-item-done' : 'task-item'} key={task.id}>
          <label className="task-main">
            <input
              className="task-checkbox"
              checked={task.done}
              disabled={isMutating}
              onChange={() => onToggleTask(task)}
              type="checkbox"
            />
            <span className="task-copy">
              <strong className="task-title">{task.title}</strong>
              <span className="task-status">{task.done ? 'Concluida' : 'Pendente'}</span>
            </span>
          </label>

          <button
            className="task-delete"
            disabled={isMutating}
            onClick={() => onDeleteTask(task)}
            type="button"
          >
            Excluir
          </button>
        </li>
      ))}
    </ul>
  )
}
