'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import type { CreateBalanceItemInput } from '@/types/balance'

/**
 * Balance Snapshot을 다음 달로 복사
 */
export async function copyBalanceSnapshotToNextMonth(
  sourceYear: number,
  sourceMonth: number,
  items: CreateBalanceItemInput[],
  overwrite: boolean = false
): Promise<{ year: number; month: number }> {
  const supabase = await createServerClient()

  // 다음 달 계산
  let targetYear = sourceYear
  let targetMonth = sourceMonth + 1
  if (targetMonth > 12) {
    targetMonth = 1
    targetYear += 1
  }

  // 다음 달 스냅샷이 이미 있는지 확인
  const { data: existingSnapshot } = await supabase
    .from('balance_snapshots')
    .select('id')
    .eq('year', targetYear)
    .eq('month', targetMonth)
    .single()

  let snapshotId: string

  if (existingSnapshot) {
    if (!overwrite) {
      throw new Error(`${targetYear}년 ${targetMonth}월 스냅샷이 이미 존재합니다.`)
    }

    // 덮어쓰기: 기존 항목 삭제
    const { error: deleteError } = await supabase
      .from('balance_items')
      .delete()
      .eq('snapshot_id', existingSnapshot.id)

    if (deleteError) throw deleteError

    snapshotId = existingSnapshot.id
  } else {
    // 새 스냅샷 생성
    const { data: newSnapshot, error: snapshotError } = await supabase
      .from('balance_snapshots')
      .insert({ year: targetYear, month: targetMonth })
      .select()
      .single()

    if (snapshotError) throw snapshotError
    snapshotId = newSnapshot.id
  }

  // 항목 복사
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      snapshot_id: snapshotId,
      category_level1: item.category_level1,
      category_level2: item.category_level2,
      category_level3: item.category_level3,
      amount: item.amount,
    }))

    const { error: itemsError } = await supabase
      .from('balance_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError
  }

  revalidatePath('/balance')
  return { year: targetYear, month: targetMonth }
}
