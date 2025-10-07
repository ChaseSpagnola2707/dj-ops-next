import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = createRouteHandlerClient({ cookies })
  const { data, error } = await s
    .from('messages')
    .select('id,text,created_at,sender_member_id')
    .eq('event_id', params.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const s = createRouteHandlerClient({ cookies })
  const { data: { user } } = await s.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const text = String(body.text || '').trim()
  if (!text) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const { data: event, error: evErr } = await s.from('events').select('id, org_id').eq('id', params.id).single()
  if (evErr || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const { data: member } = await s
    .from('organization_members')
    .select('id')
    .eq('org_id', event.org_id)
    .eq('user_id', user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Not a member of this org' }, { status: 403 })

  const { data: inserted, error } = await s
    .from('messages')
    .insert({
      org_id: event.org_id,
      event_id: event.id,
      sender_member_id: member.id,
      text,
    })
    .select('id,text,created_at,sender_member_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: inserted }, { status: 201 })
}
