import { NextResponse } from 'next/server'
import { getFriendlyDatabaseError } from '@/lib/databaseError'
import { createServerSupabase, getAccessToken } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const accessToken = getAccessToken(request)

  if (!accessToken) {
    return NextResponse.json({ error: 'Sessao nao encontrada.' }, { status: 401 })
  }

  const supabase = createServerSupabase(accessToken)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Sessao invalida.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('done')
    .eq('user_id', user.id)

  if (error) {
    const friendlyError = getFriendlyDatabaseError(error)
    return NextResponse.json({ error: friendlyError.message }, { status: friendlyError.status })
  }

  const total = data?.length ?? 0
  const completed = data?.filter((task) => task.done).length ?? 0
  const pending = total - completed
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return NextResponse.json({
    total,
    completed,
    pending,
    completionRate,
  })
}
