import { supabaseServer } from '@/lib/supabaseServer'

export default async function Dashboard() {
  const s = supabaseServer()
  const { data: { session } } = await s.auth.getSession()
  const { data: mems } = await s.from('organization_members').select('*').eq('user_id', session!.user.id)
  const org = mems?.[0]?.org_id
  const { data: events } = await s.from('events').select('*').eq('org_id', org).order('starts_at').limit(5)
  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <h2 className="font-medium mb-2">Next events</h2>
      <ul className="space-y-2">
        {events?.map(e => (
          <li key={e.id}>{e.title} — {new Date(e.starts_at).toLocaleString()}</li>
        )) || <li>No events yet.</li>}
      </ul>
    </main>
  )
}
