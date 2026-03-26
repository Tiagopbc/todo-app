'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import AuthPanel from '@/components/AuthPanel'
import TaskList from '@/components/TaskList'
import {
  createTask,
  deleteTask,
  getStats,
  getTasks,
  updateTask,
} from '@/lib/taskApiClient'
import { supabase } from '@/lib/supabaseClient'
import type { Task, TaskStats } from '@/lib/tasks'

const landingHighlights = [
  {
    title: 'Privacidade por usuario',
    description: 'Cada conta acessa somente as tarefas que pertencem ao proprio espaco de trabalho.',
  },
  {
    title: 'Acoes em segundos',
    description: 'Criacao, conclusao e exclusao acontecem no mesmo fluxo, sem sair da tela principal.',
  },
  {
    title: 'Visao de progresso',
    description: 'O dashboard resume totais, pendencias e taxa de conclusao para facilitar decisoes.',
  },
] as const

const onboardingSteps = [
  'Crie sua conta ou entre com email e senha.',
  'Adicione tarefas, marque o que foi concluido e remova o que nao faz mais sentido.',
  'Abra o dashboard quando quiser enxergar o andamento do dia.',
] as const

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
        <section className="hero hero-primary">
          <p className="eyebrow">Preparando o ambiente</p>
          <h1>Carregando sua area de trabalho...</h1>
          <p className="hero-lead">
            Estamos conferindo sua sessao e organizando o painel para mostrar apenas o que importa.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      {!session ? (
        <section className="hero-layout">
          <section className="hero hero-primary">
            <p className="eyebrow">Todo App com Supabase</p>
            <h1>Organize o dia sem perder o que ja foi feito.</h1>
            <p className="hero-lead">
              Cada usuario acessa apenas as proprias tarefas, conclui itens em segundos
              e acompanha o progresso no dashboard sem sair do fluxo.
            </p>

            <div className="hero-pills" aria-label="Principais beneficios">
              <span className="hero-pill">Login seguro</span>
              <span className="hero-pill">Tarefas isoladas por usuario</span>
              <span className="hero-pill">Dashboard de progresso</span>
            </div>

            <div className="feature-grid">
              {landingHighlights.map((highlight) => (
                <article className="feature-card" key={highlight.title}>
                  <p>{highlight.title}</p>
                  <strong>{highlight.description}</strong>
                </article>
              ))}
            </div>
          </section>

          <div className="hero-sidebar">
            <AuthPanel
              onAuthenticated={async () => {
                setError(null)
                await refreshTasks()
              }}
            />

            <section className="panel panel-muted">
              <div className="panel-header panel-header-compact">
                <div>
                  <p className="eyebrow">Como funciona</p>
                  <h2>Um fluxo simples para entrar e produzir</h2>
                </div>
              </div>

              <ol className="step-list">
                {onboardingSteps.map((step, index) => (
                  <li className="step-item" key={step}>
                    <span className="step-index">{index + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>
      ) : (
        <>
          <section className="hero hero-compact">
            <p className="eyebrow">Painel pessoal</p>
            <h1>Sua rotina, organizada em um so lugar.</h1>
            <p className="hero-lead">
              Adicione tarefas rapidamente, acompanhe o que ja foi concluido
              e abra o dashboard quando quiser uma leitura mais analitica do progresso.
            </p>
          </section>

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
