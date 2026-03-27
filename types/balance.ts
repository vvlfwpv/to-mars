import { UUID, Timestamp } from './database'

export type BalanceSnapshot = {
  id: UUID
  group_id: UUID
  year: number
  month: number
  created_at: Timestamp
}

export type BalanceItem = {
  id: UUID
  snapshot_id: UUID
  category_level1: string
  category_level2: string
  category_level3: string
  amount: number
  created_at: Timestamp
}

export type BalanceSnapshotWithItems = BalanceSnapshot & {
  balance_items: BalanceItem[]
}

export type CreateBalanceItemInput = Omit<
  BalanceItem,
  'id' | 'created_at'
>

export type UpdateBalanceItemInput = Partial<
  Omit<BalanceItem, 'id' | 'snapshot_id' | 'created_at'>
>
