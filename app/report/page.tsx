import type { Metadata } from 'next'
import { CampusShell } from '@/components/campus-shell'
import { ReportItemForm } from '@/components/report-item-form'

export const metadata: Metadata = {
  title: 'Report an item · Campus Lost & Found',
  description:
    'Report a lost or found item on campus with details; photos are optional. Demo — submissions are not saved.',
}

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialType = params.type === 'found' ? 'found' : 'lost'
  const title = initialType === 'lost' ? 'Report a lost item' : 'Report a found item'

  return (
    <CampusShell title={title} showBack backHref="/">
      <ReportItemForm initialType={initialType} />
    </CampusShell>
  )
}
