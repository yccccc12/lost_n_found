import { CampusShell } from '@/components/campus-shell'
import { FoundPageTitle } from '@/components/found-page-title'
import { ItemCard } from '@/components/item-card'
import { foundItems } from '@/lib/mock-items'

export default function FoundItemsPage() {
  return (
    <CampusShell showBack backHref="/" titleSlot={<FoundPageTitle />}>
      <div className="space-y-6">
        <p className="max-w-2xl text-muted-foreground">
          Items turned in to campus staff or community members. (Mock data for demo.)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {foundItems.map((item) => (
            <ItemCard key={item.id} item={item} href={`/found/${item.id}`} />
          ))}
        </div>
      </div>
    </CampusShell>
  )
}
