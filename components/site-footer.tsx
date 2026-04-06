import Link from 'next/link'
import { cn } from '@/lib/utils'

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'border-t-4 border-black bg-white/50 px-4 sm:px-6 md:px-8 py-10 mt-12',
        className
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <p className="font-black text-lg tracking-tight">Campus Lost &amp; Found</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connecting students with belongings across campus—one claim at a time.
          </p>
        </div>
        <div className="space-y-3">
          <p className="font-black text-sm uppercase tracking-wide">Resources</p>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link href="#" className="underline-offset-4 hover:underline">
                Campus safety
              </Link>
            </li>
            <li>
              <Link href="#" className="underline-offset-4 hover:underline">
                Contact support
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="font-black text-sm uppercase tracking-wide">Legal</p>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link href="#" className="underline-offset-4 hover:underline">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="#" className="underline-offset-4 hover:underline">
                Terms of service
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="font-black text-sm uppercase tracking-wide">Contact</p>
          <p className="text-sm text-muted-foreground">
            Central Campus Hub, Room 104
            <br />
            Mon–Fri 9am–5pm
          </p>
          <p className="text-sm text-muted-foreground">lostfound@university.edu</p>
          <p className="text-sm text-muted-foreground">+1 (555) 010-4200</p>
        </div>
      </div>
      <p className="text-center text-xs font-bold text-muted-foreground mt-10 pt-8 border-t-2 border-black/10">
        © {new Date().getFullYear()} University administration · Lost &amp; Found division
      </p>
    </footer>
  )
}
