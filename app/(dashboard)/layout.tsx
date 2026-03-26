import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation userEmail={user.email || ''} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
