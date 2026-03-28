import { createServerClient } from '@/lib/supabase/client'
import type { BalanceSnapshot, BalanceSnapshotWithItems } from '@/types/balance'
import { getCurrentUserGroupId } from './group'

/**
 * 특정 년월의 Balance Snapshot 조회 (items 포함)
 */
export async function getBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshotWithItems | null> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select(`
      *,
      balance_items (*)
    `)
    .eq('group_id', groupId)
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

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select('*')
    .eq('group_id', groupId)
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

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select(`
      id,
      group_id,
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
    .eq('group_id', groupId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as BalanceSnapshotWithItems[]
}

/**
 * 특정 년월 이후의 Balance Snapshots 조회 (items 포함, 최근 N개월용)
 */
export async function getRecentBalanceSnapshotsWithItems(
  fromYear: number,
  fromMonth: number
): Promise<BalanceSnapshotWithItems[]> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select(`
      id,
      group_id,
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
    .eq('group_id', groupId)
    .gte('year', fromYear)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return (data as BalanceSnapshotWithItems[]).filter(
    (s) => s.year > fromYear || (s.year === fromYear && s.month >= fromMonth)
  )
}

/**
 * Balance Snapshot 생성 (빈 스냅샷)
 */
export async function createBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshot> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('balance_snapshots')
    .insert({ group_id: groupId, year, month })
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
