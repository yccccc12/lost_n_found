'use client'

import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

type SemanticSearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function SemanticSearchBar({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Search for items...',
  className,
}: SemanticSearchBarProps) {
  return (
    <form
      role="search"
      className={cn('w-full max-w-2xl', className)}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {/*
        Single border + hard shadow (matches item cards) — avoids the heavy “double outline” look.
      */}
      <div className="flex min-h-[50px] items-center gap-3 rounded-full border-2 border-black bg-white px-4 py-2.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-shadow focus-within:shadow-[5px_5px_0_0_rgba(0,0,0,1)] sm:min-h-[52px] sm:px-5">
        {/*
          Do not disable the only submit control when the field is empty: in many browsers
          Enter in the input will not submit the form if the sole submit button is disabled.
          Empty queries are ignored in the parent handler instead.
        */}
        <button
          type="submit"
          disabled={disabled}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label="Search"
        >
          <Search className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </button>
        <input
          type="text"
          name="q"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (!disabled) onSubmit()
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-60"
        />
      </div>
    </form>
  )
}
