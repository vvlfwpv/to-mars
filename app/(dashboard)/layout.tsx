import { createServerClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { getUserGroups, getCurrentUserGroupId } from '@/lib/queries/group'

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

  const [userGroups, currentGroupId] = await Promise.all([
    getUserGroups(),
    getCurrentUserGroupId(),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        userEmail={user.email || ''}
        userGroups={userGroups}
        currentGroupId={currentGroupId}
      />
      <main className="flex-1">{children}</main>
    </div>
  )
}
