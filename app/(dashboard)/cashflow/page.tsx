import { getAllCashflowItems } from '@/lib/queries/cashflow'
import { getAllOwners } from '@/lib/queries/owner'
import { CashflowPageClient } from '@/components/cashflow/cashflow-page-client'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CashflowPage() {
  const [items, owners] = await Promise.all([
    getAllCashflowItems(),
    getAllOwners(),
  ])

  return <CashflowPageClient items={items} owners={owners} />
}
