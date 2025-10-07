export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function Events() {
  const s = supabaseServer()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return <main className="p-4">Please log in.</main>

  const { data: mems } = await s.from('organization_members').select('org_id').eq('user_id', user.id)
  const org = mems?.[0]?.org_id
  if (!org) return <main className="p-4">No organization yet. Create one in <a className="underline" href="/settings">Settings</a>.</main>

  const { data: events, error } = await s.from('events').select('*').eq('org_id', org).order('starts_at')
  if (error) return <main className="p-4 text-red-600">Error: {error.message}</main>

  return (
    <main>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Events</h1>
        <Link href="/events/new" className="text-sm underline">New Event</Link>
      </div>
      <ul className="space-y-2">
        {events?.length ? events.map(e => (
          <li key={e.id}>
            <Link href={`/events/${e.id}`} className="hover:underline">
              {e.title} — {new Date(e.starts_at).toLocaleString()}
            </Link>
          </li>
        )) : <li>No events yet.</li>}
      </ul>
    </main>
  )
}
