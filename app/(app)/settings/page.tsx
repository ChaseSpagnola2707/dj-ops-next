export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabaseServer'

export default async function Settings(){
  const s = supabaseServer()
  const { data: { user } } = await s.auth.getUser()
  if (!user) return <main className="p-4">Please log in.</main>

  // fetch orgs the user manages
  const { data: mems } = await s
    .from('organization_members')
    .select('org_id, role')
    .eq('user_id', user.id)

  const orgIds = (mems ?? []).map(m => m.org_id)
  const { data: orgs } = await s.from('organizations').select('id,name').in('id', orgIds)

  async function createOrg(formData: FormData) {
    'use server'
    const s = supabaseServer()
    const name = String(formData.get('name') || '').trim()
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/orgs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
  }

  async function invite(formData: FormData) {
    'use server'
    const s = supabaseServer()
    const org_id = String(formData.get('org_id') || '')
    const email = String(formData.get('email') || '')
    const role = String(formData.get('role') || 'assistant')
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || ''
    const site = base.startsWith('http') ? base : `https://${base}`

    const res = await fetch(`${site}/api/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org_id, email, role }),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(await res.text())
  }

  return (
    <main className="p-6 space-y-6">
      <section className="max-w-lg border rounded p-4 bg-white">
        <h2 className="font-semibold mb-2">Create Organization</h2>
        <form action={createOrg} className="space-y-2">
          <input name="name" placeholder="Org name" className="border p-2 w-full rounded" required />
          <button className="bg-black text-white px-4 py-2 rounded">Create</button>
        </form>
      </section>

      <section className="max-w-lg border rounded p-4 bg-white">
        <h2 className="font-semibold mb-2">Invite Member</h2>
        <form action={invite} className="space-y-2">
          <select name="org_id" className="border p-2 w-full rounded" required>
            <option value="">Select organization</option>
            {orgs?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input name="email" type="email" placeholder="email@domain.com" className="border p-2 w-full rounded" required />
          <select name="role" className="border p-2 w-full rounded" defaultValue="assistant">
            <option value="manager">Manager</option>
            <option value="lead">Lead</option>
            <option value="assistant">Assistant</option>
          </select>
          <button className="bg-black text-white px-4 py-2 rounded">Send Invite Link</button>
        </form>
        <p className="text-sm text-neutral-600 mt-2">
          After submit, copy the invite link from the API response in logs or wire an email sender later.
        </p>
      </section>
    </main>
  )
}
