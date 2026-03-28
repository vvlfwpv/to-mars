import { SettingsPageClient } from '@/components/settings/settings-page-client'
import { getUserGroups, getCurrentUserGroupId, getGroupMembersWithEmails } from '@/lib/queries/group'
import { createServerClient } from '@/lib/supabase/client'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const [userGroups, currentGroupId] = await Promise.all([
    getUserGroups(),
    getCurrentUserGroupId(),
  ])

  // Fetch members for the current group with emails
  const groupMembers = await getGroupMembersWithEmails(currentGroupId)

  return (
    <SettingsPageClient
      userGroups={userGroups}
      currentGroupId={currentGroupId}
      groupMembers={groupMembers}
      currentUserId={user.id}
    />
  )
}
