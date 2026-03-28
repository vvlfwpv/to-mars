import { createServerClient } from '@/lib/supabase/client'
import { getRecentBalanceSnapshotsWithItems } from '@/lib/queries/balance'
import { getRecentInvestmentSnapshotsWithItems } from '@/lib/queries/investment'
import { getCurrentUserGroupId } from '@/lib/queries/group'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkHasOlderSnapshots(fromYear: number, fromMonth: number): Promise<boolean> {
  const supabase = await createServerClient()
  const groupId = await getCurrentUserGroupId()
  const fromYearMonth = fromYear * 100 + fromMonth

  const [{ data: oldestBalance }, { data: oldestInvestment }] = await Promise.all([
    supabase
      .from('balance_snapshots')
      .select('year, month')
      .eq('group_id', groupId)
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .limit(1)
      .single(),
    supabase
      .from('investment_snapshots')
      .select('year, month')
      .eq('group_id', groupId)
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .limit(1)
      .single(),
  ])

  const hasOlderBalance = oldestBalance && oldestBalance.year * 100 + oldestBalance.month < fromYearMonth
  const hasOlderInvestment = oldestInvestment && oldestInvestment.year * 100 + oldestInvestment.month < fromYearMonth

  return !!(hasOlderBalance || hasOlderInvestment)
}

export default async function DashboardPage() {
  // 최근 12개월 기준 날짜 계산
  const now = new Date()
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const fromYear = fromDate.getFullYear()
  const fromMonth = fromDate.getMonth() + 1

  const [balanceSnapshots, investmentSnapshots, hasOlderData] = await Promise.all([
    getRecentBalanceSnapshotsWithItems(fromYear, fromMonth),
    getRecentInvestmentSnapshotsWithItems(fromYear, fromMonth),
    checkHasOlderSnapshots(fromYear, fromMonth),
  ])

  return (
    <DashboardClient
      balanceSnapshots={balanceSnapshots}
      investmentSnapshots={investmentSnapshots}
      hasOlderData={hasOlderData}
    />
  )
}
