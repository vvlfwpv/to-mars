import { createServerClient } from '@/lib/supabase/client'
import type { CashflowItem } from '@/types/cashflow'

/**
 * 모든 Cashflow Items 조회
 */
export async function getAllCashflowItems(): Promise<CashflowItem[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('cashflow_items')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as CashflowItem[]
}
