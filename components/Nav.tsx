'use client'
import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex gap-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/events">Events</Link>
        <Link href="/inventory">Inventory</Link>
        <Link href="/people">People</Link>
        <Link href="/settings">Settings</Link>
        <div className="ml-auto">
          <form action="/logout" method="post">
            <button className="text-sm text-neutral-600">Logout</button>
          </form>
        </div>
      </div>
    </nav>
  )
}
