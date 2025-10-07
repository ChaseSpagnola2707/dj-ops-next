export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function InviteAccept({ params }: { params: { token: string } }) {
  const s = supabaseServer()
  const { data: { user } } = await s.auth.getUser()
  if (!user) {
    // not logged in → send to login then back here
    redirect(`/login?next=/invite/${params.token}`)
  }

  async function accept() {
    'use server'
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/invites/${params.token}/accept`, {
      method: 'POST',
      cache: 'no-store'
    })
    if (!res.ok) throw new Error(await res.text())
    redirect('/events')
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-xl font-semibold mb-2">You’ve been invited</h1>
      <p className="text-sm text-neutral-700 mb-4">
        Click Accept to join the organization with your current account.
      </p>
      <form action={accept}>
        <button className="bg-black text-white px-4 py-2 rounded">Accept Invite</button>
      </form>
    </main>
  )
}
