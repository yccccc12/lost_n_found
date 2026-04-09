import type { Metadata } from 'next'
import { CampusShell } from '@/components/campus-shell'
import { FoundItemsExplorer } from '@/components/found-items-explorer'
import { LostItemsExplorer } from '@/components/lost-items-explorer'
import { FoundPageTitle } from '@/components/found-page-title'
import { LostPageTitle } from '@/components/lost-page-title'
import { fetchItemsByStatus } from '@/lib/backend-items'

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
    const lost = await fetchItemsByStatus('lost')
    return (
      <CampusShell showBack backHref="/" titleSlot={<LostPageTitle />}>
        <div className="space-y-6">
          {!lost.ok ? (
            <p className="max-w-2xl rounded-xl border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {lost.message}
            </p>
          ) : null}
          <LostItemsExplorer initialLostItems={lost.items} />
        </div>
      </CampusShell>
    )
  }

  const found = await fetchItemsByStatus('found')

  return (
    <CampusShell showBack backHref="/" titleSlot={<FoundPageTitle />}>
      {!found.ok ? (
        <p className="mb-6 max-w-2xl rounded-xl border-2 border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {found.message}
        </p>
      ) : null}
      <FoundItemsExplorer initialFoundItems={found.items} />
    </CampusShell>
  )
}
