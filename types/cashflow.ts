import { UUID, Timestamp } from './database'

export type CashflowCategory = '수입' | '고정비' | '비유동투자'

export type CashflowItem = {
  id: UUID
  group_id: UUID
  owner: string            // 다은, 필제, 공동 (자유입력)
  category: CashflowCategory
  item_name: string        // 근로소득, 보험료 등
  description: string | null // DB손보, 새마을공제 등 (비고)
  amount: number           // 금액
  created_at: Timestamp
}

export type CreateCashflowItemInput = Omit<
  CashflowItem,
  'id' | 'group_id' | 'created_at'
>

export type UpdateCashflowItemInput = Partial<
  Omit<CashflowItem, 'id' | 'group_id' | 'created_at'>
>

// Cashflow 계산용 타입
export type CashflowSummary = {
  owner: string
  income: number
  fixed_expense: number
  investment: number
  total: number
}

export type TotalCashflowSummary = {
  total_income: number
  total_fixed_expense: number
  savings: number
  savings_rate: number
}
