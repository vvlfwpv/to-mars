import type { UUID, Timestamp } from './database'

export type PortfolioSector = {
  id: UUID
  group_id: UUID
  name: string
  priority: number
  target_weight: number
  created_at: Timestamp
}

export type PortfolioTarget = {
  id: UUID
  group_id: UUID
  sector_id: UUID | null
  stock_code: string
  stock_name: string
  target_weight: number
  created_at: Timestamp
}

export type PortfolioSectorWithTargets = PortfolioSector & {
  targets: PortfolioTarget[]
}

export type CreatePortfolioSectorInput = {
  name: string
  priority: number
  target_weight: number
}

export type UpdatePortfolioSectorInput = Partial<CreatePortfolioSectorInput>

export type CreatePortfolioTargetInput = {
  sector_id: UUID | null
  stock_code: string
  stock_name: string
  target_weight: number
}

export type UpdatePortfolioTargetInput = Partial<CreatePortfolioTargetInput>
