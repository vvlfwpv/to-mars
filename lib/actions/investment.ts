'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import type {
  CreateInvestmentItemInput,
  UpdateInvestmentItemInput,
  InvestmentItem
} from '@/types/investment'

/**
 * Investment Item 생성
 */
export async function createInvestmentItem(
  input: CreateInvestmentItemInput
): Promise<InvestmentItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_items')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/investment')
  return data as InvestmentItem
}

/**
 * Investment Item 수정
 */
export async function updateInvestmentItem(
  id: string,
  input: UpdateInvestmentItemInput
): Promise<InvestmentItem> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('investment_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/investment')
  return data as InvestmentItem
}

/**
 * Investment Item 삭제
 */
export async function deleteInvestmentItem(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('investment_items')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/investment')
}
