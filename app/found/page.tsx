import { redirect } from 'next/navigation'

/** @deprecated Use `/browse?type=found` */
export default function FoundItemsRedirect() {
  redirect('/browse?type=found')
}
