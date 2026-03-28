'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/client'
import { getCurrentUserGroupId } from '@/lib/queries/group'
import type {
  CreatePortfolioSectorInput,
  UpdatePortfolioSectorInput,
  CreatePortfolioTargetInput,
  UpdatePortfolioTargetInput,
} from '@/types/portfolio'

// Portfolio Sector Actions
export async function createPortfolioSector(input: CreatePortfolioSectorInput): Promise<string> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('portfolio_sectors')
    .insert({
      group_id: groupId,
      ...input,
    })
    .select('id')
    .single()

  if (error) throw error
  revalidatePath('/portfolio')
  return data.id
}

export async function updatePortfolioSector(
  id: string,
  input: UpdatePortfolioSectorInput
): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('portfolio_sectors')
    .update(input)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/portfolio')
}

export async function deletePortfolioSector(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('portfolio_sectors')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/portfolio')
}

// Portfolio Target Actions
export async function createPortfolioTarget(input: CreatePortfolioTargetInput): Promise<void> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { error } = await supabase
    .from('portfolio_targets')
    .insert({
      group_id: groupId,
      ...input,
    })

  if (error) throw error
  revalidatePath('/portfolio')
}

export async function updatePortfolioTarget(
  id: string,
  input: UpdatePortfolioTargetInput
): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('portfolio_targets')
    .update(input)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/portfolio')
}

export async function deletePortfolioTarget(id: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('portfolio_targets')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/portfolio')
}
