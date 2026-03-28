import { getOrCreateInvestmentSnapshot, getLatestInvestmentSnapshotMeta } from '@/lib/queries/investment'
import { InvestmentPageClient } from '@/components/investment/investment-page-client'

// 캐싱 비활성화 - 항상 최신 데이터 표시
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function InvestmentPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const year = parseInt(params.year || currentYear.toString())
  const month = parseInt(params.month || currentMonth.toString())

  const snapshot = await getOrCreateInvestmentSnapshot(year, month)
  const latestMeta = await getLatestInvestmentSnapshotMeta()
  const isLatestSnapshot =
    !latestMeta || (latestMeta.year === year && latestMeta.month === month)

  return (
    <InvestmentPageClient
      snapshot={snapshot}
      initialYear={year}
      initialMonth={month}
      isLatestSnapshot={isLatestSnapshot}
    />
  )
}
