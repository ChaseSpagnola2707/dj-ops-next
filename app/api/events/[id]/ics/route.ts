import { NextResponse } from 'next/server'
import { supabaseRoute } from '@/lib/supabaseServer'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = supabaseRoute()
  const { data: e } = await s.from('events').select('*').eq('id', params.id).single()
  if (!e) return new NextResponse('Not found', { status: 404 })
  const toICS = (d: string) => new Date(d).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DJ Ops//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@djops`,
    `DTSTAMP:${toICS(e.starts_at)}`,
    `DTSTART:${toICS(e.starts_at)}`,
    `DTEND:${toICS(e.ends_at)}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.venue ?? ''}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n')
  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename=event-${e.id}.ics`
    }
  })
}
