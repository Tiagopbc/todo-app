'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import AuthPanel from '@/components/AuthPanel'
import TaskList from '@/components/TaskList'
import { supabase } from '@/lib/supabaseClient'
import type { Task, TaskStats } from '@/lib/tasks'

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error
  }

  return fallback
}

async function getTasks(): Promise<Task[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  const response = await fetch('/api/tasks', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel carregar as tarefas.'))
  }

  return Array.isArray(body) ? (body as Task[]) : []
}

async function createTask(title: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ title }),
  })

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel salvar a tarefa.'))
  }
}

async function updateTask(taskId: number, done: boolean) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ done }),
  })

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel atualizar a tarefa.'))
  }
}

async function deleteTask(taskId: number) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel excluir a tarefa.'))
  }
}

async function getStats(): Promise<TaskStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  const response = await fetch('/api/stats', {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel carregar as estatisticas.'))
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('total' in body) ||
    !('completed' in body) ||
    !('pending' in body) ||
    !('completionRate' in body)
  ) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      completionRate: 0,
    }
  }

  return body as TaskStats
}

export default function Home() {
  const [task, setTask] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMutatingTask, setIsMutatingTask] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadSession() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!ignore) {
          setSession(currentSession)
        }
      } catch (currentError) {
        if (!ignore) {
          setError(currentError instanceof Error ? currentError.message : 'Erro inesperado.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!ignore) {
        setSession(currentSession)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  async function refreshTasks() {
    const [updatedTasks, updatedStats] = await Promise.all([getTasks(), getStats()])
    setTasks(updatedTasks)
    setStats(updatedStats)
  }

  useEffect(() => {
    let ignore = false

    async function loadAuthenticatedData() {
      if (!session) {
        setTasks([])
        setStats({
          total: 0,
          completed: 0,
          pending: 0,
          completionRate: 0,
        })
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const [loadedTasks, loadedStats] = await Promise.all([getTasks(), getStats()])

        if (!ignore) {
          setTasks(loadedTasks)
          setStats(loadedStats)
        }
      } catch (currentError) {
        if (!ignore) {
          setError(currentError instanceof Error ? currentError.message : 'Erro inesperado.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadAuthenticatedData()

    return () => {
      ignore = true
    }
  }, [session])

  async function handleAddTask() {
    const title = task.trim()

    if (!title) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createTask(title)
      await refreshTasks()
      setTask('')
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Erro inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleTask(currentTask: Task) {
    setIsMutatingTask(true)
    setError(null)

    try {
      await updateTask(currentTask.id, !currentTask.done)
      await refreshTasks()
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Erro inesperado.')
    } finally {
      setIsMutatingTask(false)
    }
  }

  async function handleDeleteTask(currentTask: Task) {
    setIsMutatingTask(true)
    setError(null)

    try {
      await deleteTask(currentTask.id)
      await refreshTasks()
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Erro inesperado.')
    } finally {
      setIsMutatingTask(false)
    }
  }

  async function handleSignOut() {
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
    }
  }

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">Lista de tarefas</p>
          <h1>Carregando sua area de trabalho...</h1>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Desafio</p>
        <h1>
          Cada usuario visualiza apenas as proprias tarefas, marca itens como concluidos,
          remove registros e acompanha o progresso no dashboard.
        </h1>
      </section>

      {!session ? (
        <AuthPanel
          onAuthenticated={async () => {
            setError(null)
            await refreshTasks()
          }}
        />
      ) : (
        <>
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Sessao ativa</p>
                <h2>{session.user.email}</h2>
              </div>
              <div className="header-actions">
                <Link className="ghost-button" href="/dashboard">
                  Ver dashboard
                </Link>
                <button className="ghost-button" onClick={() => void handleSignOut()} type="button">
                  Sair
                </button>
              </div>
            </div>

            <div className="quick-stats">
              <div>
                <span>Total</span>
                <strong>{stats.total}</strong>
              </div>
              <div>
                <span>Concluidas</span>
                <strong>{stats.completed}</strong>
              </div>
              <div>
                <span>Pendentes</span>
                <strong>{stats.pending}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Nova tarefa</p>
                <h2>Adicione e acompanhe seus itens</h2>
              </div>
            </div>

            <form
              className="task-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleAddTask()
              }}
            >
              <input
                onChange={(event) => setTask(event.target.value)}
                placeholder="Digite uma nova tarefa..."
                value={task}
              />

              <button className="primary-button" disabled={isSubmitting || !task.trim()} type="submit">
                {isSubmitting ? 'Salvando...' : 'Adicionar'}
              </button>
            </form>

            {error ? <p className="feedback feedback-error">{error}</p> : null}

            <TaskList
              isMutating={isMutatingTask}
              onDeleteTask={(currentTask) => void handleDeleteTask(currentTask)}
              onToggleTask={(currentTask) => void handleToggleTask(currentTask)}
              tasks={tasks}
            />
          </section>
        </>
      )}
    </main>
  )
}
