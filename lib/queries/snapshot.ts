import { createServerClient } from '@/lib/supabase/client'

/**
 * 특정 년월의 Balance Snapshot이 존재하는지 확인
 */
export async function checkBalanceSnapshotExists(
  year: number,
  month: number
): Promise<boolean> {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('balance_snapshots')
    .select('id')
    .eq('year', year)
    .eq('month', month)
    .single()

  return !!data
}

/**
 * 특정 년월의 Investment Snapshot이 존재하는지 확인
 */
export async function checkInvestmentSnapshotExists(
  year: number,
  month: number
): Promise<boolean> {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('investment_snapshots')
    .select('id')
    .eq('year', year)
    .eq('month', month)
    .single()

  return !!data
}
