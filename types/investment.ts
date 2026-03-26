import { UUID, Timestamp } from './database'

export type InvestmentSnapshot = {
  id: UUID
  year: number
  month: number
  created_at: Timestamp
}

export type InvestmentItem = {
  id: UUID
  snapshot_id: UUID
  category: string         // 한국주식, 미국주식, 미국ETF 등
  code: string | null      // 종목코드
  name: string             // 종목명
  principal: number        // 원금
  month_end_value: number  // 월말평가액
  quantity: number | null  // 보유수량
  created_at: Timestamp
}

export type InvestmentSnapshotWithItems = InvestmentSnapshot & {
  investment_items: InvestmentItem[]
}

export type CreateInvestmentItemInput = Omit<
  InvestmentItem,
  'id' | 'created_at'
>

export type UpdateInvestmentItemInput = Partial<
  Omit<InvestmentItem, 'id' | 'snapshot_id' | 'created_at'>
>
