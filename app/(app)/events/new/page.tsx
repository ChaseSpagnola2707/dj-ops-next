export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function NewEvent() {
  const s = supabaseServer()
  const { data: { user } } = await s.auth.getUser()
  if (!user) redirect('/login')

  const { data: mems, error: memErr } = await s
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', user.id)

  if (memErr) return <main className="p-4 text-red-600">Error loading membership: {memErr.message}</main>
  const org = mems?.[0]?.org_id
  if (!org) return <main className="p-4">No organization yet. Create one in <a className="underline" href="/settings">Settings</a>.</main>

  async function create(formData: FormData) {
    'use server'
    const s = supabaseServer()
    const title = String(formData.get('title') || 'Untitled')
    const starts = String(formData.get('starts_at') || '')
    const ends = String(formData.get('ends_at') || '')
    const venue = String(formData.get('venue') || '')

    if (!starts || !ends) throw new Error('Start and end are required.')

    const { error } = await s.from('events').insert({
      org_id: org,
      title,
      starts_at: new Date(starts).toISOString(),
      ends_at: new Date(ends).toISOString(),
      venue,
    })
    if (error) throw new Error(error.message)

    redirect('/events')
  }

  return (
    <form action={create} className="space-y-3 max-w-md">
      <h1 className="text-xl font-semibold">New Event</h1>
      <input name="title" placeholder="Title" className="border p-2 w-full rounded" />
      <input name="venue" placeholder="Venue" className="border p-2 w-full rounded" />
      <label className="block text-sm">Start</label>
      <input name="starts_at" type="datetime-local" className="border p-2 w-full rounded" required />
      <label className="block text-sm">End</label>
      <input name="ends_at" type="datetime-local" className="border p-2 w-full rounded" required />
      <button className="bg-black text-white px-4 py-2 rounded">Create</button>
    </form>
  )
}
