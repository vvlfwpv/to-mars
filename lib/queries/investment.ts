import { createServerClient } from '@/lib/supabase/client'
import type { InvestmentSnapshot, InvestmentSnapshotWithItems } from '@/types/investment'

/**
 * 특정 년월의 Investment Snapshot 조회 (items 포함)
 */
export async function getInvestmentSnapshot(
  year: number,
  month: number
): Promise<InvestmentSnapshotWithItems | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      *,
      investment_items (*)
    `)
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { referencedTable: 'investment_items', ascending: true })
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as InvestmentSnapshotWithItems
}

/**
 * 모든 Investment Snapshots 조회 (items 없이)
 */
export async function getAllInvestmentSnapshots(): Promise<InvestmentSnapshot[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as InvestmentSnapshot[]
}

/**
 * 모든 Investment Snapshots 조회 (items 포함)
 */
export async function getAllInvestmentSnapshotsWithItems(): Promise<InvestmentSnapshotWithItems[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      id,
      year,
      month,
      created_at,
      investment_items (
        id,
        principal,
        month_end_value,
        category,
        code,
        name,
        quantity
      )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as InvestmentSnapshotWithItems[]
}

/**
 * Investment Snapshot 생성 (빈 스냅샷)
 */
export async function createInvestmentSnapshot(
  year: number,
  month: number
): Promise<InvestmentSnapshot> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .insert({ year, month })
    .select()
    .single()

  if (error) throw error

  return data as InvestmentSnapshot
}

/**
 * Investment Snapshot이 존재하는지 확인 후, 없으면 생성
 */
export async function getOrCreateInvestmentSnapshot(
  year: number,
  month: number
): Promise<InvestmentSnapshotWithItems> {
  const existing = await getInvestmentSnapshot(year, month)

  if (existing) {
    return existing
  }

  const newSnapshot = await createInvestmentSnapshot(year, month)

  return {
    ...newSnapshot,
    investment_items: []
  }
}
