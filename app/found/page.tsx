import { CampusShell } from '@/components/campus-shell'
import { FoundItemsExplorer } from '@/components/found-items-explorer'
import { FoundPageTitle } from '@/components/found-page-title'

export default function FoundItemsPage() {
  return (
    <CampusShell showBack backHref="/" titleSlot={<FoundPageTitle />}>
      <FoundItemsExplorer />
    </CampusShell>
  )
}
