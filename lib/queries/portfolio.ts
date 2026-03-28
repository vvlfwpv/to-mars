import { createServerClient } from '@/lib/supabase/client'
import type { PortfolioSector, PortfolioTarget, PortfolioSectorWithTargets } from '@/types/portfolio'
import { getCurrentUserGroupId } from './group'

export async function getPortfolioSectors(): Promise<PortfolioSector[]> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('portfolio_sectors')
    .select('*')
    .eq('group_id', groupId)
    .order('priority', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data as PortfolioSector[]
}

export async function getPortfolioTargets(): Promise<PortfolioTarget[]> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()

  const { data, error } = await supabase
    .from('portfolio_targets')
    .select('*')
    .eq('group_id', groupId)

  if (error) throw error
  return data as PortfolioTarget[]
}

export async function getPortfolioSectorsWithTargets(): Promise<PortfolioSectorWithTargets[]> {
  const [sectors, targets] = await Promise.all([
    getPortfolioSectors(),
    getPortfolioTargets(),
  ])

  return sectors.map(sector => ({
    ...sector,
    targets: targets.filter(target => target.sector_id === sector.id)
  }))
}

export async function getPortfolioTargetById(id: string): Promise<PortfolioTarget> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('portfolio_targets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PortfolioTarget
}

export async function getPortfolioSectorById(id: string): Promise<PortfolioSector> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('portfolio_sectors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as PortfolioSector
}
