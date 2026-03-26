'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import type {
  CreateBalanceItemInput,
  UpdateBalanceItemInput,
  BalanceItem
} from '@/types/balance'

/**
 * Balance Item 생성
 */
export async function createBalanceItem(
  input: CreateBalanceItemInput
): Promise<BalanceItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_items')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/balance')
  return data as BalanceItem
}

/**
 * Balance Item 수정
 */
export async function updateBalanceItem(
  id: string,
  input: UpdateBalanceItemInput
): Promise<BalanceItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('balance_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/balance')
  return data as BalanceItem
}

/**
 * Balance Item 삭제
 */
export async function deleteBalanceItem(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('balance_items')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/balance')
}
