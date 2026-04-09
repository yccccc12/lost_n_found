/** “Recent found items” with a thick rule under “Recent” only; “found items” in green. */
export function FoundPageTitle() {
  return (
    <h1 className="text-left font-black tracking-tight">
      <span className="border-b-4 border-black pb-0.5 text-xl text-black sm:text-2xl md:text-3xl">
        Recent
      </span>
      <span className="text-xl text-emerald-600 sm:text-2xl md:text-3xl"> found items</span>
    </h1>
  )
}
