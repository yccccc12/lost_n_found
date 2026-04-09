import { redirect } from 'next/navigation'

/** @deprecated Use `/browse?type=lost` */
export default function LostItemsRedirect() {
  redirect('/browse?type=lost')
}
