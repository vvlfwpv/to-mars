import { createServerClient } from '@/lib/supabase/client'
import type { InvestmentSnapshot, InvestmentSnapshotWithItems } from '@/types/investment'
import { getCurrentUserGroupId } from './group'
import { fetchExchangeRate } from '@/lib/services/exchange-rate'

/**
 * 특정 년월의 Investment Snapshot 조회 (items 포함)
 */
export async function getInvestmentSnapshot(
  year: number,
  month: number
): Promise<InvestmentSnapshotWithItems | null> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      *,
      investment_items (*)
    `)
    .eq('group_id', groupId)
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

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select('*')
    .eq('group_id', groupId)
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

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      id,
      group_id,
      year,
      month,
      exchange_rate,
      created_at,
      investment_items (
        id,
        principal,
        month_end_value,
        category,
        code,
        name,
        quantity,
        currency
      )
    `)
    .eq('group_id', groupId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return data as InvestmentSnapshotWithItems[]
}

/**
 * 특정 년월 이후의 Investment Snapshots 조회 (items 포함, 최근 N개월용)
 */
export async function getRecentInvestmentSnapshotsWithItems(
  fromYear: number,
  fromMonth: number
): Promise<InvestmentSnapshotWithItems[]> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      id,
      group_id,
      year,
      month,
      exchange_rate,
      created_at,
      investment_items (
        id,
        principal,
        month_end_value,
        category,
        code,
        name,
        quantity,
        currency
      )
    `)
    .eq('group_id', groupId)
    .gte('year', fromYear)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error

  return (data as InvestmentSnapshotWithItems[]).filter(
    (s) => s.year > fromYear || (s.year === fromYear && s.month >= fromMonth)
  )
}

/**
 * Investment Snapshot 생성 (빈 스냅샷)
 */
export async function createInvestmentSnapshot(
  year: number,
  month: number
): Promise<InvestmentSnapshot> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  // 환율 조회
  const exchangeRate = await fetchExchangeRate()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .insert({ group_id: groupId, year, month, exchange_rate: exchangeRate })
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

/**
 * 가장 최근 Investment Snapshot의 year/month만 조회 (경량)
 */
export async function getLatestInvestmentSnapshotMeta(): Promise<{ year: number; month: number } | null> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select('year, month')
    .eq('group_id', groupId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * 가장 최근 Investment Snapshot 조회 (items 포함)
 */
export async function getLatestInvestmentSnapshot(): Promise<InvestmentSnapshotWithItems | null> {
  const supabase = await createServerClient()

  // Get current user's group
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('investment_snapshots')
    .select(`
      *,
      investment_items (*)
    `)
    .eq('group_id', groupId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .order('created_at', { referencedTable: 'investment_items', ascending: true })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as InvestmentSnapshotWithItems
}
