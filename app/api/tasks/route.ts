import { NextResponse } from 'next/server'
import { authenticateRequest, hasAuthenticationFailure } from '@/lib/server/auth'
import { createDatabaseErrorResponse } from '@/lib/server/databaseResponse'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await authenticateRequest(request)

  if (hasAuthenticationFailure(auth)) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .select('id, title, done')
    .eq('user_id', auth.user.id)
    .order('id', { ascending: true })

  if (error) {
    return createDatabaseErrorResponse('GET /api/tasks', error)
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request)

  if (hasAuthenticationFailure(auth)) {
    return auth.response
  }

  const body: unknown = await request.json().catch(() => null)
  const title =
    body && typeof body === 'object' && 'title' in body && typeof body.title === 'string'
      ? body.title.trim()
      : ''

  if (!title) {
    return NextResponse.json({ error: 'O titulo da tarefa e obrigatorio.' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .insert({ title, done: false, user_id: auth.user.id })
    .select('id, title, done')
    .single()

  if (error) {
    return createDatabaseErrorResponse('POST /api/tasks', error)
  }

  return NextResponse.json(data, { status: 201 })
}
