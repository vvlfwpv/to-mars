import { createServerClient } from '@/lib/supabase/client'
import type { CashflowItem } from '@/types/cashflow'
import { getCurrentUserGroupId } from './group'

/**
 * 모든 Cashflow Items 조회
 */
export async function getAllCashflowItems(): Promise<CashflowItem[]> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('cashflow_items')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as CashflowItem[]
}
