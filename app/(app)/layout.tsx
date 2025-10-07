import { ReactNode } from 'react'
import Nav from '@/components/Nav'
import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const s = supabaseServer()
  const { data: { user }, error } = await s.auth.getUser()
  if (error) {
    // If auth lookup fails, send them to login instead of crashing
    redirect('/login')
  }
  if (!user) {
    redirect('/login')
  }
  return (
    <>
      <Nav />
      <div className="mx-auto max-w-5xl p-4">{children}</div>
    </>
  )
}
