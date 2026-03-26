'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'

type NavigationProps = {
  userEmail: string
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/balance', label: 'Balance' },
  { href: '/investment', label: 'Investment' },
  { href: '/cashflow', label: 'Cashflow' },
]

export function Navigation({ userEmail }: NavigationProps) {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-8">
        <div className="flex items-center gap-6 flex-1">
          <h1 className="text-xl font-bold">Household Finance</h1>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
