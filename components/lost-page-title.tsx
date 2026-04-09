/** Mirrors FoundPageTitle: “Recent” rule + “ lost items” in red. */
export function LostPageTitle() {
  return (
    <h1 className="text-left font-black tracking-tight">
      <span className="border-b-4 border-black pb-0.5 text-xl text-black sm:text-2xl md:text-3xl">
        Recent
      </span>
      <span className="text-xl text-red-600 sm:text-2xl md:text-3xl"> lost items</span>
    </h1>
  )
}
