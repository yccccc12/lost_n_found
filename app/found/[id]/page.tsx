import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FoundItemDetailView } from '@/components/found-item-detail-view'
import { getFoundItemDetail } from '@/lib/mock-items'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const item = getFoundItemDetail(id)
  if (!item) return { title: 'Item not found' }
  return {
    title: `${item.name} · Found`,
    description: item.description,
  }
}

export default async function FoundItemPage({ params }: Props) {
  const { id } = await params
  const item = getFoundItemDetail(id)
  if (!item) notFound()

  return <FoundItemDetailView item={item} />
}
