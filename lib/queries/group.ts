import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/client'
import type { Group, GroupMember } from '@/types/group'

/**
 * 현재 로그인한 사용자의 group_id를 조회
 * React cache()로 같은 요청 내에서 중복 호출 방지
 */
export const getCurrentUserGroupId = cache(async (): Promise<string> => {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get user's group
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    throw new Error('User is not assigned to any group')
  }

  return data.group_id
})

/**
 * 특정 그룹 조회
 */
export async function getGroupById(groupId: string): Promise<Group | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as Group
}

/**
 * 그룹의 모든 멤버 조회
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as GroupMember[]
}

/**
 * 현재 사용자의 그룹 조회
 */
export async function getCurrentUserGroup(): Promise<Group | null> {
  const groupId = await getCurrentUserGroupId()
  return await getGroupById(groupId)
}
