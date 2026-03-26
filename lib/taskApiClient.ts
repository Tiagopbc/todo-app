import { supabase } from '@/lib/supabaseClient'
import type { Task, TaskStats } from '@/lib/tasks'

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error
  }

  return fallback
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sessao nao encontrada.')
  }

  return session.access_token
}

async function requestWithSession(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const accessToken = await getAccessToken()
  const headers = new Headers(init?.headers)

  headers.set('Authorization', `Bearer ${accessToken}`)

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    cache: init?.cache ?? 'no-store',
    headers,
  })
}

export async function getTasks(): Promise<Task[]> {
  const response = await requestWithSession('/api/tasks')
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel carregar as tarefas.'))
  }

  return Array.isArray(body) ? (body as Task[]) : []
}

export async function createTask(title: string) {
  const response = await requestWithSession('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel salvar a tarefa.'))
  }
}

export async function updateTask(taskId: number, done: boolean) {
  const response = await requestWithSession(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel atualizar a tarefa.'))
  }
}

export async function deleteTask(taskId: number) {
  const response = await requestWithSession(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(body, 'Nao foi possivel excluir a tarefa.'))
  }
}

export async function getStats(): Promise<TaskStats> {
  const response = await requestWithSession('/api/stats')
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
