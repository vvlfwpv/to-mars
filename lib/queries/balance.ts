import { createServerClient } from '@/lib/supabase/client'
import type { BalanceSnapshot, BalanceSnapshotWithItems } from '@/types/balance'

/**
 * 특정 년월의 Balance Snapshot 조회 (items 포함)
 */
export async function getBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshotWithItems | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select(`
      *,
      balance_items (*)
    `)
    .eq('year', year)
    .eq('month', month)
    .order('created_at', { referencedTable: 'balance_items', ascending: true })
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data as BalanceSnapshotWithItems
}

/**
 * 모든 Balance Snapshots 조회 (items 없이)
 */
export async function getAllBalanceSnapshots(): Promise<BalanceSnapshot[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as BalanceSnapshot[]
}

/**
 * 모든 Balance Snapshots 조회 (items 포함)
 */
export async function getAllBalanceSnapshotsWithItems(): Promise<BalanceSnapshotWithItems[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select(`
      id,
      year,
      month,
      created_at,
      balance_items (
        id,
        amount,
        category_level1,
        category_level2,
        category_level3
      )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as BalanceSnapshotWithItems[]
}

/**
 * Balance Snapshot 생성 (빈 스냅샷)
 */
export async function createBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshot> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .insert({ year, month })
    .select()
    .single()

  if (error) throw error

  return data as BalanceSnapshot
}

/**
 * Balance Snapshot이 존재하는지 확인 후, 없으면 생성
 */
export async function getOrCreateBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshotWithItems> {
  const existing = await getBalanceSnapshot(year, month)

  if (existing) {
    return existing
  }

  // 스냅샷 생성
  const newSnapshot = await createBalanceSnapshot(year, month)

  return {
    ...newSnapshot,
    balance_items: []
  }
}
