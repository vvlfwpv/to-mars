'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Menu, Rocket } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { switchGroup } from '@/lib/actions/group'
import type { Group } from '@/types/group'

type NavigationProps = {
  userEmail: string
  userGroups: Group[]
  currentGroupId: string
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/balance', label: 'Balance' },
  { href: '/investment', label: 'Investment' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/cashflow', label: 'Cashflow' },
  { href: '/settings', label: 'Settings' },
]

export function Navigation({ userEmail, userGroups, currentGroupId }: NavigationProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const currentGroup = userGroups.find(g => g.id === currentGroupId)

  const handleGroupChange = async (groupId: string) => {
    try {
      await switchGroup(groupId)
      window.location.reload()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to switch group:', error)
      }
    }
  }

  return (
    <div className="sticky top-0 z-50 border-b theme-nav-bg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <Link href="/" className="flex items-center">
            <span className="text-base font-semibold sm:text-lg">To Mars</span>
          </Link>
        </div>

        {/* Group Selector - Desktop */}
        <div className="ml-4 hidden md:block">
          <Select value={currentGroupId} onValueChange={handleGroupChange}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue>
                {currentGroup?.name || '그룹 선택'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                  {group.is_sample && ' (샘플)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Navigation */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted',
                pathname === item.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {/* User Email - Hidden on mobile */}
          <span className="hidden text-xs text-muted-foreground sm:inline-block sm:text-sm">
            {userEmail}
          </span>

          {/* Logout Button */}
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Logout
            </Button>
            <Button type="submit" variant="ghost" size="sm" className="sm:hidden">
              <span className="text-xs">Logout</span>
            </Button>
          </form>

          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-left">
                  <Rocket className="h-5 w-5 text-primary" />
                  To Mars
                </SheetTitle>
              </SheetHeader>

              {/* Group Selector - Mobile */}
              <div className="mt-6">
                <label className="mb-2 block px-3 text-xs font-medium text-muted-foreground">
                  현재 그룹
                </label>
                <Select value={currentGroupId} onValueChange={handleGroupChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {currentGroup?.name || '그룹 선택'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                        {group.is_sample && ' (샘플)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 border-t pt-4">
                <p className="px-3 text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
