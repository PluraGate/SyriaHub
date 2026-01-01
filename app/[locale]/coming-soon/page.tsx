import { ComingSoon } from '@/components/ComingSoon'

interface PageProps {
  params: Promise<{ locale: string }>
}

export const metadata = {
  title: 'SyriaHub — Under Development',
  description: 'This platform is under active development. Access will open when the system is ready.',
  robots: 'noindex, nofollow',
}

export default async function ComingSoonPage({ params }: PageProps) {
  const { locale } = await params
  
  return <ComingSoon locale={locale} />
}
