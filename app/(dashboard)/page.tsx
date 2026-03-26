import { getAllBalanceSnapshotsWithItems } from '@/lib/queries/balance'
import { getAllInvestmentSnapshotsWithItems } from '@/lib/queries/investment'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const balanceSnapshots = await getAllBalanceSnapshotsWithItems()
  const investmentSnapshots = await getAllInvestmentSnapshotsWithItems()

  return (
    <DashboardClient
      balanceSnapshots={balanceSnapshots}
      investmentSnapshots={investmentSnapshots}
    />
  )
}
