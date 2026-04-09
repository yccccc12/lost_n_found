/** Thick rule under “Item”; all text pure black (no accent color). */
export function ItemDetailsPageTitle() {
  return (
    <h1 className="text-left font-black tracking-tight">
      <span className="border-b-4 border-black pb-0.5 text-xl text-black sm:text-2xl md:text-3xl">
        Item
      </span>
      <span className="text-xl text-black sm:text-2xl md:text-3xl"> Details</span>
    </h1>
  )
}
