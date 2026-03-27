import { UUID, Timestamp } from './database'

export type InvestmentSnapshot = {
  id: UUID
  group_id: UUID
  year: number
  month: number
  exchange_rate: number | null  // USD to KRW 환율
  created_at: Timestamp
}

export type InvestmentItem = {
  id: UUID
  snapshot_id: UUID
  category: string         // 국내주식, 해외주식, 해외ETF 등
  code: string | null      // 종목코드
  name: string             // 종목명
  principal: number        // 원금 (currency에 따라 원 또는 달러)
  month_end_value: number  // 월말평가액 (currency에 따라 원 또는 달러)
  quantity: number | null  // 보유수량
  currency: string         // 통화 (KRW 또는 USD)
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
