export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabaseServer } from '@/lib/supabaseServer'
import EventChat from '@/components/EventChat'

export default async function EventDetail({ params }: { params: { id: string }}) {
  const s = supabaseServer()
  const { data: e, error } = await s.from('events').select('*').eq('id', params.id).single()

  if (error || !e) {
    return <main className="p-4">Not found</main>
  }

  return (
    <main className="space-y-4">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">{e.title}</h1>
        <div>
          {new Date(e.starts_at).toLocaleString()} — {new Date(e.ends_at).toLocaleString()}
        </div>
        {e.venue && <div>Venue: {e.venue}</div>}
        <Link href={`/api/events/${e.id}/ics`} className="underline">
          Add to Calendar (.ics)
        </Link>
      </section>

      {/* Event messaging */}
      <EventChat eventId={e.id} />
    </main>
  )
}
