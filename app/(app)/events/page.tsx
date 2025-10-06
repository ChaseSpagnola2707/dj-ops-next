import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'

export default async function Events() {
  const s = supabaseServer()
  const { data: { session } } = await s.auth.getSession()
  const { data: mems } = await s.from('organization_members').select('*').eq('user_id', session!.user.id)
  const org = mems?.[0]?.org_id
  const { data: events } = await s.from('events').select('*').eq('org_id', org).order('starts_at')

  return (
    <main>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Events</h1>
        <Link href="/events/new" className="text-sm underline">New Event</Link>
      </div>
      <ul className="space-y-2">
        {events?.map(e => (
          <li key={e.id}>
            <Link href={`/events/${e.id}`} className="hover:underline">
              {e.title} — {new Date(e.starts_at).toLocaleString()}
            </Link>
          </li>
        )) || <li>No events yet.</li>}
      </ul>
    </main>
  )
}
