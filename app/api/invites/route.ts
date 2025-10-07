import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const s = createRouteHandlerClient({ cookies })
  const { data: { user } } = await s.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { org_id, email, role } = await req.json().catch(() => ({}))
  if (!org_id || !email || !role) {
    return NextResponse.json({ error: 'org_id, email, role are required' }, { status: 400 })
  }

  // Ensure caller is a manager of this org
  const { data: caller } = await s.from('organization_members')
    .select('role').eq('org_id', org_id).eq('user_id', user.id).single()
  if (!caller || caller.role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can invite' }, { status: 403 })
  }

  const { data: invite, error } = await s.from('invitations')
    .insert({
      org_id,
      email: String(email).toLowerCase().trim(),
      role,
      invited_by: user.id
    })
    .select('token')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Return an invite URL you can share
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || ''
  const site = base.startsWith('http') ? base : `https://${base}`
  const url = `${site}/invite/${invite.token}`

  return NextResponse.json({ url })
}
