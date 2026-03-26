'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import type {
  CreateCashflowItemInput,
  UpdateCashflowItemInput,
  CashflowItem
} from '@/types/cashflow'

/**
 * Cashflow Item 생성
 */
export async function createCashflowItem(
  input: CreateCashflowItemInput
): Promise<CashflowItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('cashflow_items')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/cashflow')
  return data as CashflowItem
}

/**
 * Cashflow Item 수정
 */
export async function updateCashflowItem(
  id: string,
  input: UpdateCashflowItemInput
): Promise<CashflowItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('cashflow_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/cashflow')
  return data as CashflowItem
}

/**
 * Cashflow Item 삭제
 */
export async function deleteCashflowItem(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('cashflow_items')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/cashflow')
}
