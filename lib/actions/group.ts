'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import { setSelectedGroupId } from '@/lib/utils/group-cookie'

/**
 * 새 그룹 생성 및 생성자를 멤버로 추가
 */
export async function createGroup(name: string, description?: string): Promise<string> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 그룹 생성
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      description: description || null,
      is_sample: false,
      is_read_only: false,
    })
    .select()
    .single()

  if (groupError) throw groupError

  // 생성자를 그룹 멤버로 추가
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    })

  if (memberError) throw memberError

  // 새로 만든 그룹으로 자동 전환
  await setSelectedGroupId(group.id)

  revalidatePath('/')
  return group.id
}

/**
 * 그룹 이름 및 설명 업데이트
 */
export async function updateGroup(
  groupId: string,
  updates: { name?: string; description?: string }
): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .eq('is_read_only', false) // 읽기 전용 그룹은 수정 불가

  if (error) throw error

  revalidatePath('/')
}

/**
 * 현재 선택된 그룹 변경
 */
export async function switchGroup(groupId: string): Promise<void> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 사용자가 해당 그룹에 속해있는지 확인
  const { data, error } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    throw new Error('User is not a member of this group')
  }

  await setSelectedGroupId(groupId)
  revalidatePath('/')
}

/**
 * 그룹 삭제 (Sample Group은 삭제 불가)
 */
export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = await createServerClient()

  // Sample Group인지 확인
  const { data: group } = await supabase
    .from('groups')
    .select('is_sample')
    .eq('id', groupId)
    .single()

  if (group?.is_sample) {
    throw new Error('Cannot delete sample group')
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) throw error

  revalidatePath('/')
}

/**
 * 그룹에 사용자 초대 (이메일로)
 */
export async function inviteUserToGroup(groupId: string, userEmail: string): Promise<void> {
  const supabase = await createServerClient()

  // 현재 사용자가 해당 그룹의 멤버인지 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    throw new Error('You are not a member of this group')
  }

  // 초대할 사용자 찾기 (RPC 함수 사용)
  const { data: invitedUserId, error: userError } = await supabase
    .rpc('get_user_id_by_email', { user_email: userEmail })

  // RPC 함수가 없는 경우 더 명확한 에러 메시지
  if (userError) {
    if (userError.message?.includes('function') || userError.code === '42883') {
      throw new Error('Database migration required. Please run the user lookup functions migration.')
    }
    throw new Error('Failed to lookup user')
  }

  if (!invitedUserId) {
    throw new Error('User not found')
  }

  // 이미 그룹에 속해있는지 확인
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', invitedUserId)
    .single()

  if (existingMember) {
    throw new Error('User is already a member of this group')
  }

  // 그룹에 추가
  const { error: insertError } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: invitedUserId,
    })

  if (insertError) throw insertError

  revalidatePath('/')
}

/**
 * 그룹에서 사용자 제거
 */
export async function removeUserFromGroup(groupId: string, userId: string): Promise<void> {
  const supabase = await createServerClient()

  // Sample Group에서는 제거 불가
  const { data: group } = await supabase
    .from('groups')
    .select('is_sample')
    .eq('id', groupId)
    .single()

  if (group?.is_sample) {
    throw new Error('Cannot remove users from sample group')
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) throw error

  revalidatePath('/')
}
