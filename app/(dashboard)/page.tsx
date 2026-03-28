import { getAllBalanceSnapshotsWithItems } from '@/lib/queries/balance'
import { getAllInvestmentSnapshotsWithItems } from '@/lib/queries/investment'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const [balanceSnapshots, investmentSnapshots] = await Promise.all([
    getAllBalanceSnapshotsWithItems(),
    getAllInvestmentSnapshotsWithItems(),
  ])

  return (
    <DashboardClient
      balanceSnapshots={balanceSnapshots}
      investmentSnapshots={investmentSnapshots}
    />
  )
}
