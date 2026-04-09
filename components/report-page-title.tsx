/** Matches browse titles: “lost” in red, “found” in emerald. */
export function ReportPageTitle({ variant }: { variant: 'lost' | 'found' }) {
  return (
    <h1 className="truncate text-left text-xl font-black tracking-tight sm:text-2xl md:text-3xl">
      {variant === 'lost' ? (
        <>
          Report a <span className="text-red-600">lost item</span>
        </>
      ) : (
        <>
          Report a <span className="text-emerald-600">found item</span>
        </>
      )}
    </h1>
  )
}
