export type Task = {
  id: number
  title: string
  done: boolean
}

export type TaskStats = {
  total: number
  completed: number
  pending: number
  completionRate: number
}
