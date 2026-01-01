/**
 * Coming Soon Layout
 * 
 * Minimal layout that just passes children through.
 * The main purpose is to signal to the root layout that this is a coming-soon page.
 */
export const metadata = {
  title: 'SyriaHub — Under Development',
  description: 'This platform is under active development. Access will open when the system is ready.',
  robots: 'noindex, nofollow',
}

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
