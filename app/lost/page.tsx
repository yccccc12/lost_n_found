import { CampusShell } from '@/components/campus-shell'
import { ItemCard } from '@/components/item-card'
import { lostItems } from '@/lib/mock-items'

export default function LostItemsPage() {
  return (
    <CampusShell title="Lost items" showBack>
      <div className="space-y-6">
        <p className="text-muted-foreground max-w-2xl">
          Recently reported missing belongings on campus. (Mock data for demo.)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {lostItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </CampusShell>
  )
}
