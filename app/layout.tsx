import './globals.css'
import { ReactNode } from 'react'

export const metadata = { title: 'DJ Ops', description: 'Multi-company DJ ops' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
