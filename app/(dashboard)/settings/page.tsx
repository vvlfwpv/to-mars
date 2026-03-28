import { SettingsPageClient } from '@/components/settings/settings-page-client'
import { getUserGroups, getCurrentUserGroupId } from '@/lib/queries/group'

export default async function SettingsPage() {
  const [userGroups, currentGroupId] = await Promise.all([
    getUserGroups(),
    getCurrentUserGroupId(),
  ])

  return <SettingsPageClient userGroups={userGroups} currentGroupId={currentGroupId} />
}
