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
    .select('done')
    .eq('user_id', auth.user.id)

  if (error) {
    return createDatabaseErrorResponse('GET /api/stats', error)
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
