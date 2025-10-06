'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const r = useRouter()
  const s = supabase()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'signup') {
      const { error } = await s.auth.signUp({ email, password: pwd })
      if (error) return alert(error.message)
      alert('Check your email to confirm, then sign in.')
    } else {
      const { error } = await s.auth.signInWithPassword({ email, password: pwd })
      if (error) return alert(error.message)
      r.push('/dashboard')
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">DJ Ops Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="w-full bg-black text-white py-2 rounded">{mode==='signin'?'Sign in':'Sign up'}</button>
      </form>
      <button className="mt-3 text-sm underline" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
        {mode==='signin'?'Create account':'Have an account? Sign in'}
      </button>
    </main>
  )
}
