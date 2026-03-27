'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import type { CreateOwnerInput, UpdateOwnerInput } from '@/types/owner'
import { getCurrentUserGroupId } from '@/lib/queries/group'

/**
 * 소유자 생성
 */
export async function createOwner(input: CreateOwnerInput): Promise<void> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { error } = await supabase.from('owners').insert({
    group_id: groupId,
    name: input.name,
  })

  if (error) throw error

  revalidatePath('/cashflow')
}

/**
 * 소유자 수정
 */
export async function updateOwner(id: string, input: UpdateOwnerInput): Promise<void> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  // 기존 소유자 이름 조회
  const { data: oldOwner } = await supabase
    .from('owners')
    .select('name')
    .eq('group_id', groupId)
    .eq('id', id)
    .single()

  if (!oldOwner) {
    throw new Error('소유자를 찾을 수 없습니다.')
  }

  // 소유자 이름 업데이트
  const { error: updateError } = await supabase.from('owners').update({
    name: input.name,
  })
  .eq('group_id', groupId)
  .eq('id', id)

  if (updateError) throw updateError

  // cashflow_items의 owner 필드도 함께 업데이트
  const { error: cashflowError } = await supabase
    .from('cashflow_items')
    .update({ owner: input.name })
    .eq('group_id', groupId)
    .eq('owner', oldOwner.name)

  if (cashflowError) throw cashflowError

  revalidatePath('/cashflow')
}

/**
 * 소유자 삭제
 */
export async function deleteOwner(id: string): Promise<void> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  // 소유자 이름 조회
  const { data: owner } = await supabase
    .from('owners')
    .select('name')
    .eq('group_id', groupId)
    .eq('id', id)
    .single()

  if (!owner) {
    throw new Error('소유자를 찾을 수 없습니다.')
  }

  // 해당 소유자를 사용하는 cashflow_items가 있는지 확인
  const { data: items } = await supabase
    .from('cashflow_items')
    .select('id')
    .eq('group_id', groupId)
    .eq('owner', owner.name)
    .limit(1)

  if (items && items.length > 0) {
    throw new Error('해당 소유자를 사용 중인 항목이 있어 삭제할 수 없습니다.')
  }

  const { error } = await supabase.from('owners').delete()
    .eq('group_id', groupId)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/cashflow')
}
