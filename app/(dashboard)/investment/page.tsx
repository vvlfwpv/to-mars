import { getOrCreateInvestmentSnapshot, getAllInvestmentSnapshots } from '@/lib/queries/investment'
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

  // 모든 스냅샷 조회해서 현재가 마지막 스냅샷인지 확인
  const allSnapshots = await getAllInvestmentSnapshots()
  const isLatestSnapshot =
    allSnapshots.length === 0 ||
    (allSnapshots[0].year === year && allSnapshots[0].month === month)

  return (
    <InvestmentPageClient
      snapshot={snapshot}
      initialYear={year}
      initialMonth={month}
      isLatestSnapshot={isLatestSnapshot}
    />
  )
}
