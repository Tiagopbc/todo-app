'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import StatsCards from '@/components/StatsCards'
import { getStats } from '@/lib/taskApiClient'
import { supabase } from '@/lib/supabaseClient'
import type { TaskStats } from '@/lib/tasks'

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadPage() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (!currentSession) {
          if (!ignore) {
            setSession(null)
          }
          return
        }

        const nextStats = await getStats()

        if (!ignore) {
          setSession(currentSession)
          setStats(nextStats)
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

    void loadPage()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Dashboard</p>
        <h1>Seu progresso em um relance.</h1>
        <p className="hero-lead">
          Acompanhe volume, pendencias e taxa de conclusao sem perder o contexto das suas tarefas.
        </p>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Resumo</p>
            <h2>{session?.user.email ?? 'Sessao nao encontrada'}</h2>
          </div>
          <Link className="ghost-button" href="/">
            Voltar para tarefas
          </Link>
        </div>

        {isLoading ? <p>Carregando indicadores...</p> : null}
        {error ? <p className="feedback feedback-error">{error}</p> : null}

        {!isLoading && !error && session ? (
          <>
            <StatsCards stats={stats} />
            <div className="chart-panel" aria-hidden="true">
              <div style={{ width: `${stats.completionRate}%` }} />
            </div>
            <p className="chart-caption">
              {stats.completionRate}% das tarefas cadastradas ja foram concluidas.
            </p>
          </>
        ) : null}

        {!isLoading && !session ? (
          <p>
            Voce precisa entrar na aplicacao principal para carregar suas estatisticas.
          </p>
        ) : null}
      </section>
    </main>
  )
}
