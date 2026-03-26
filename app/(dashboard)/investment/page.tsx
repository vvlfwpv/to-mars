import { getOrCreateInvestmentSnapshot } from '@/lib/queries/investment'
import { InvestmentPageClient } from '@/components/investment/investment-page-client'

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

  return <InvestmentPageClient snapshot={snapshot} initialYear={year} initialMonth={month} />
}
