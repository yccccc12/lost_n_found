import type { Metadata } from 'next'
import { CampusShell } from '@/components/campus-shell'
import { ItemCard } from '@/components/item-card'
import { FoundItemsExplorer } from '@/components/found-items-explorer'
import { FoundPageTitle } from '@/components/found-page-title'
import { LostPageTitle } from '@/components/lost-page-title'
import { lostItems } from '@/lib/mock-items'

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const kind = params.type === 'found' ? 'found' : 'lost'
  return {
    title:
      kind === 'lost'
        ? 'Lost items · Campus Lost & Found'
        : 'Found items · Campus Lost & Found',
  }
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const params = await searchParams
  const kind = params.type === 'found' ? 'found' : 'lost'

  if (kind === 'lost') {
    return (
      <CampusShell showBack backHref="/" titleSlot={<LostPageTitle />}>
        <div className="space-y-6">
          <p className="text-muted-foreground max-w-2xl">
            Recently reported missing belongings on campus. (Mock data for demo.)
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {lostItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CampusShell>
    )
  }

  return (
    <CampusShell showBack backHref="/" titleSlot={<FoundPageTitle />}>
      <FoundItemsExplorer />
    </CampusShell>
  )
}
