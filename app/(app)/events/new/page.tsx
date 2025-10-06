import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function NewEvent() {
  const s = supabaseServer()
  const { data: { session } } = await s.auth.getSession()
  const { data: mems } = await s.from('organization_members').select('*').eq('user_id', session!.user.id)
  const org = mems?.[0]?.org_id

  async function create(formData: FormData) {
    'use server'
    const title = String(formData.get('title') || 'Untitled')
    const starts = new Date(String(formData.get('starts_at') || ''))
    const ends = new Date(String(formData.get('ends_at') || ''))
    const venue = String(formData.get('venue') || '')
    const { error } = await s.from('events').insert({ org_id: org, title, starts_at: starts.toISOString(), ends_at: ends.toISOString(), venue })
    if (error) throw error
    redirect('/events')
  }

  return (
    <form action={create} className="space-y-3 max-w-md">
      <h1 className="text-xl font-semibold">New Event</h1>
      <input name="title" placeholder="Title" className="border p-2 w-full rounded" />
      <input name="venue" placeholder="Venue" className="border p-2 w-full rounded" />
      <label className="block text-sm">Start</label>
      <input name="starts_at" type="datetime-local" className="border p-2 w-full rounded" />
      <label className="block text-sm">End</label>
      <input name="ends_at" type="datetime-local" className="border p-2 w-full rounded" />
      <button className="bg-black text-white px-4 py-2 rounded">Create</button>
    </form>
  )
}
