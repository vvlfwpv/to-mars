import { createServerClient } from '@/lib/supabase/client'
import type { Owner } from '@/types/owner'
import { getCurrentUserGroupId } from './group'

/**
 * 모든 소유자 조회
 */
export async function getAllOwners(): Promise<Owner[]> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as Owner[]
}

/**
 * 특정 소유자 조회
 */
export async function getOwnerById(id: string): Promise<Owner | null> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('group_id', groupId)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as Owner
}
