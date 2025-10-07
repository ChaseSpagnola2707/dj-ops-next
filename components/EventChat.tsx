'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Msg = { id: string; text: string; created_at: string; sender_member_id: string }

export default function EventChat({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    let alive = true
    fetch(`/api/events/${eventId}/messages`)
      .then(r => r.json())
      .then(d => { if (alive) setMessages(d.messages ?? []) })
    return () => { alive = false }
  }, [eventId])

  // Realtime updates
  useEffect(() => {
    const s = supabase()
    const ch = s
      .channel(`messages:${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${eventId}` },
        payload => setMessages(prev => [...prev, payload.new as Msg])
      )
      .subscribe()
    return () => { s.removeChannel(ch) }
  }, [eventId])

  // Autoscroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setText('')
    const res = await fetch(`/api/events/${eventId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: t }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Failed to send' }))
      alert(error || 'Failed to send')
    }
  }

  return (
    <section className="mt-6 border rounded-xl bg-white">
      <header className="px-4 py-3 border-b font-medium">Event chat</header>
      <div ref={listRef} className="max-h-80 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && <div className="text-sm text-neutral-500">No messages yet.</div>}
        {messages.map(m => (
          <div key={m.id} className="text-sm">
            <span className="mr-2 text-neutral-500">{new Date(m.created_at).toLocaleTimeString()}</span>
            <span className="font-medium">member</span>
            <span className="ml-2">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-3 flex gap-2 border-t">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button className="bg-black text-white px-4 rounded">Send</button>
      </form>
    </section>
  )
}
