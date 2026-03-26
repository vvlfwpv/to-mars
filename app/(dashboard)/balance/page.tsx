import { getOrCreateBalanceSnapshot } from '@/lib/queries/balance'
import { BalancePageClient } from '@/components/balance/balance-page-client'

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
