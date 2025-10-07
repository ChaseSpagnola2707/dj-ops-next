import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(_: Request, { params }: { params: { token: string } }) {
  const s = createRouteHandlerClient({ cookies })
  const { data: { user } } = await s.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: invite, error: invErr } = await s.from('invitations')
    .select('id, org_id, email, role, status, expires_at')
    .eq('token', params.token)
    .single()
  if (invErr || !invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  if (invite.status !== 'pending') return NextResponse.json({ error: `Invite is ${invite.status}` }, { status: 400 })
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })

  // enforce email match (basic)
  // (optional: skip if you allow any email to accept)
  const { data: authUser } = await s.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // If you want strict match, uncomment:
  // if (authUser.user?.email?.toLowerCase() !== invite.email.toLowerCase()) {
  //   return NextResponse.json({ error: 'This invite is for a different email' }, { status: 403 })
  // }

  // Upsert membership
  const { error: memErr } = await s.from('organization_members')
    .insert({ org_id: invite.org_id, user_id: user.id, role: invite.role })
    .onConflict('org_id,user_id').merge()
  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 })

  // Mark invite accepted
  await s.from('invitations').update({ status: 'accepted' }).eq('id', invite.id)

  return NextResponse.json({ ok: true })
}
