/** “Recent found items” with a thick rule under “Recent” only (inline border). */
export function FoundPageTitle() {
  return (
    <h1 className="text-left font-black tracking-tight text-black">
      <span className="border-b-4 border-black pb-0.5 text-xl sm:text-2xl md:text-3xl">
        Recent
      </span>
      <span className="text-xl sm:text-2xl md:text-3xl"> found items</span>
    </h1>
  )
}
