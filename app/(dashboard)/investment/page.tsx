import {
  getOrCreateInvestmentSnapshot,
  getLatestInvestmentSnapshotMeta,
  getAllInvestmentSnapshots
} from '@/lib/queries/investment'
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

  let year: number
  let month: number

  // URL에 년월이 지정되지 않은 경우 (초기 진입)
  if (!params.year && !params.month) {
    // 가장 최신 스냅샷 조회
    const snapshots = await getAllInvestmentSnapshots()

    if (snapshots.length > 0) {
      // 최신 스냅샷 사용
      year = snapshots[0].year
      month = snapshots[0].month
    } else {
      // 스냅샷이 없으면 현재 년월 사용
      year = currentYear
      month = currentMonth
    }
  } else {
    // URL에 년월이 지정된 경우 해당 년월 사용
    year = parseInt(params.year || currentYear.toString())
    month = parseInt(params.month || currentMonth.toString())
  }

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
