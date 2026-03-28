import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/client'
import type { Group, GroupMember } from '@/types/group'
import { getSelectedGroupId } from '@/lib/utils/group-cookie'

/**
 * 현재 로그인한 사용자의 group_id를 조회
 * 쿠키에 저장된 선택된 그룹 ID를 반환하거나, 없으면 첫 번째 그룹 반환
 * React cache()로 같은 요청 내에서 중복 호출 방지
 */
export const getCurrentUserGroupId = cache(async (): Promise<string> => {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 쿠키에서 선택된 그룹 ID 확인
  const selectedGroupId = await getSelectedGroupId()

  // 사용자가 속한 모든 그룹 조회
  const { data: groups, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  if (error || !groups || groups.length === 0) {
    throw new Error('User is not assigned to any group')
  }

  const groupIds = groups.map(g => g.group_id)

  // 선택된 그룹이 사용자가 속한 그룹 중 하나면 반환
  if (selectedGroupId && groupIds.includes(selectedGroupId)) {
    return selectedGroupId
  }

  // 없으면 첫 번째 그룹 반환
  return groupIds[0]
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

/**
 * 현재 사용자가 속한 모든 그룹 조회
 */
export async function getUserGroups(): Promise<Group[]> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Extract groups from the result
  return (data || [])
    .map((row: any) => row.groups as Group)
    .filter((group: Group | null): group is Group => group !== null)
}
