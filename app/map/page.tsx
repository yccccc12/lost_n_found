import type { Metadata } from 'next'
import { CampusMapLoader } from '@/components/campus-map-loader'
import { CampusShell } from '@/components/campus-shell'

export const metadata: Metadata = {
  title: 'Campus map · Campus Lost & Found',
  description:
    'University of Nottingham Malaysia — explore the Semenyih campus (demo map, illustrative pins).',
}

export default function CampusMapPage() {
  return (
    <CampusShell title="Campus map" showBack backHref="/">
      <CampusMapLoader />
    </CampusShell>
  )
}
