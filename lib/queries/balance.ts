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

  // Handle unique constraint violation (already exists)
  if (error) {
    if (error.code === '23505') {
      // Snapshot already exists, fetch it instead
      const existing = await getBalanceSnapshot(year, month)
      if (existing) {
        return {
          id: existing.id,
          group_id: existing.group_id,
          year: existing.year,
          month: existing.month,
          created_at: existing.created_at,
        }
      }
    }
    throw error
  }

  return data as BalanceSnapshot
}

/**
 * Balance Snapshot이 존재하는지 확인 후, 없으면 생성
 */
export async function getOrCreateBalanceSnapshot(
  year: number,
  month: number
): Promise<BalanceSnapshotWithItems> {
  // 먼저 조회
  let existing = await getBalanceSnapshot(year, month)

  if (existing) {
    return existing
  }

  // 없으면 생성 시도
  try {
    const newSnapshot = await createBalanceSnapshot(year, month)

    return {
      ...newSnapshot,
      balance_items: []
    }
  } catch (error: any) {
    // 생성 중 에러 발생 시 (race condition으로 인한 중복 등) 다시 조회
    if (error?.code === '23505') {
      existing = await getBalanceSnapshot(year, month)
      if (existing) {
        return existing
      }
    }
    // 그 외 에러는 던지기
    throw error
  }
}
