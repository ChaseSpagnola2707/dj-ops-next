import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const s = createRouteHandlerClient({ cookies })
  const { data: { user } } = await s.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json().catch(() => ({}))
  if (!name || String(name).trim().length < 2) {
    return NextResponse.json({ error: 'Organization name required' }, { status: 400 })
  }

  const { data: org, error: orgErr } = await s.from('organizations')
    .insert({ name: String(name).trim() })
    .select('id')
    .single()
  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 400 })

  const { error: memErr } = await s.from('organization_members').insert({
    org_id: org.id, user_id: user.id, role: 'manager'
  })
  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 })

  return NextResponse.json({ org })
}
