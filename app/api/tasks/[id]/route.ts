import { NextResponse } from 'next/server'
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

function getTaskId(value: string) {
  const taskId = Number(value)
  return Number.isInteger(taskId) && taskId > 0 ? taskId : null
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient(request)

  if ('response' in auth) {
    return auth.response
  }

  const { id } = await context.params
  const taskId = getTaskId(id)

  if (!taskId) {
    return NextResponse.json({ error: 'Id da tarefa invalido.' }, { status: 400 })
  }

  const body: unknown = await request.json().catch(() => null)
  const done =
    body && typeof body === 'object' && 'done' in body && typeof body.done === 'boolean'
      ? body.done
      : null

  if (done === null) {
    return NextResponse.json({ error: 'O campo done e obrigatorio.' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('tasks')
    .update({ done })
    .eq('id', taskId)
    .eq('user_id', auth.user.id)
    .select('id, title, done')
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient(request)

  if ('response' in auth) {
    return auth.response
  }

  const { id } = await context.params
  const taskId = getTaskId(id)

  if (!taskId) {
    return NextResponse.json({ error: 'Id da tarefa invalido.' }, { status: 400 })
  }

  const { error, count } = await auth.supabase
    .from('tasks')
    .delete({ count: 'exact' })
    .eq('id', taskId)
    .eq('user_id', auth.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!count) {
    return NextResponse.json({ error: 'Tarefa nao encontrada.' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
