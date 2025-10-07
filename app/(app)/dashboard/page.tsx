export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabaseServer'

export default async function Dashboard() {
  const s = supabaseServer()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return <main className="p-4">Please log in.</main>

  // find an org for this user
  const { data: mems, error: memErr } = await s
    .from('organization_members')
    .select('org_id')
    .eq('user_id', user.id)
  if (memErr) return <main className="p-4 text-red-600">Error: {memErr.message}</main>

  const org = mems?.[0]?.org_id
  if (!org) {
    return (
      <main className="p-4">
        You’re not a member of any organization yet. Create one in <a className="underline" href="/settings">Settings</a>.
      </main>
    )
  }

  const { data: events, error: evErr } = await s
    .from('events')
    .select('*')
    .eq('org_id', org)
    .order('starts_at')
    .limit(5)
  if (evErr) return <main className="p-4 text-red-600">Error: {evErr.message}</main>

  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <h2 className="font-medium mb-2">Next events</h2>
      <ul className="space-y-2">
        {events?.length ? events.map(e => (
          <li key={e.id}>{e.title} — {new Date(e.starts_at).toLocaleString()}</li>
        )) : <li>No events yet.</li>}
      </ul>
    </main>
  )
}
