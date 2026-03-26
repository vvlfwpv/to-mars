import { createServerClient } from '@/lib/supabase/client'
import type { Owner } from '@/types/owner'

/**
 * 모든 소유자 조회
 */
export async function getAllOwners(): Promise<Owner[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as Owner[]
}

/**
 * 특정 소유자 조회
 */
export async function getOwnerById(id: string): Promise<Owner | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as Owner
}
