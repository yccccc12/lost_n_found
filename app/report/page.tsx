import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { CampusShell } from '@/components/campus-shell'
import { ReportPageTitle } from '@/components/report-page-title'
import { ReportItemForm } from '@/components/report-item-form'

export const metadata: Metadata = {
  title: 'Report an item · Campus Lost & Found',
  description:
    'Report a lost or found item on campus with details; photos are optional. Demo — submissions are not saved.',
}

interface PageProps {
  searchParams: Promise<{ type?: string; matchLost?: string }>
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawMatch = params.matchLost?.trim()
  const matchLost =
    typeof rawMatch === 'string' && /^[a-f\d]{24}$/i.test(rawMatch) ? rawMatch : undefined

  const initialType: 'lost' | 'found' = params.type === 'found' ? 'found' : 'lost'
  if (matchLost && initialType !== 'found') {
    redirect(`/report?type=found&matchLost=${encodeURIComponent(matchLost)}`)
  }

  return (
    <CampusShell
      showBack
      backHref="/"
      titleSlot={<ReportPageTitle variant={initialType} />}
    >
      <ReportItemForm initialType={initialType} matchLostItemId={matchLost} />
    </CampusShell>
  )
}
