import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Syrealize - Research Platform',
  description: 'A minimalist, mobile-first research platform for collaborative knowledge sharing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
