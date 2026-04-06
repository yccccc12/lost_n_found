import type { Metadata } from 'next'
import { CampusShell } from '@/components/campus-shell'
import { ReportItemForm } from '@/components/report-item-form'

export const metadata: Metadata = {
  title: 'Report an item · Campus Lost & Found',
  description:
    'Report a lost or found item on campus with details and photos. Demo — submissions are not saved.',
}

export default function ReportPage() {
  return (
    <CampusShell title="Report an item" showBack backHref="/">
      <ReportItemForm />
    </CampusShell>
  )
}
