import { NextResponse } from 'next/server'
import { getFriendlyDatabaseError } from '@/lib/databaseError'
import { createServerSupabase, getAccessToken } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

async function getAuthenticatedClient(request: Request) {
  const accessToken = getAccessToken(request)

  if (!accessToken) {
    return {
      response: NextResponse.json({ error: 'Sessao nao encontrada.' }, { status: 401 }),
    }
  }

  const supabase = createServerSupabase(accessToken)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      response: NextResponse.json({ error: 'Sessao invalida.' }, { status: 401 }),
    }
  }

  return { supabase, user }
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request)

  if ('response' in auth) {
    return auth.response
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .select('id, title, done')
    .eq('user_id', auth.user.id)
    .order('id', { ascending: true })

  if (error) {
    const friendlyError = getFriendlyDatabaseError(error)
    return NextResponse.json({ error: friendlyError.message }, { status: friendlyError.status })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedClient(request)

  if ('response' in auth) {
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
    const friendlyError = getFriendlyDatabaseError(error)
    return NextResponse.json({ error: friendlyError.message }, { status: friendlyError.status })
  }

  return NextResponse.json(data, { status: 201 })
}
