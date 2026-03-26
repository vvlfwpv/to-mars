import { getOrCreateBalanceSnapshot } from '@/lib/queries/balance'
import { BalancePageClient } from '@/components/balance/balance-page-client'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function BalancePage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const year = parseInt(params.year || currentYear.toString())
  const month = parseInt(params.month || currentMonth.toString())

  const snapshot = await getOrCreateBalanceSnapshot(year, month)

  return <BalancePageClient snapshot={snapshot} initialYear={year} initialMonth={month} />
}
