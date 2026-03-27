'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Calendar, CalendarDays, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, FileText, PieChart } from 'lucide-react'
import type { BalanceSnapshotWithItems } from '@/types/balance'
import type { InvestmentSnapshotWithItems } from '@/types/investment'

type DashboardClientProps = {
  balanceSnapshots: BalanceSnapshotWithItems[]
  investmentSnapshots: InvestmentSnapshotWithItems[]
}

type YearMonth = {
  year: number
  month: number
}

export function DashboardClient({
  balanceSnapshots,
  investmentSnapshots,
}: DashboardClientProps) {
  const router = useRouter()

  // 뷰 모드: 'monthly' | 'yearly'
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly')

  // 모든 연월 목록 추출
  const allYearMonths = useMemo(() => {
    const balanceDates = balanceSnapshots.map((s) => ({ year: s.year, month: s.month }))
    const investmentDates = investmentSnapshots.map((s) => ({ year: s.year, month: s.month }))
    const allDates = [...balanceDates, ...investmentDates]

    // 중복 제거 및 정렬
    const uniqueDates = Array.from(
      new Map(allDates.map((d) => [`${d.year}-${d.month}`, d])).values()
    ).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    return uniqueDates
  }, [balanceSnapshots, investmentSnapshots])

  const [startDate, setStartDate] = useState<string>(
    allYearMonths.length > 0 ? `${allYearMonths[0].year}-${allYearMonths[0].month}` : ''
  )
  const [endDate, setEndDate] = useState<string>(
    allYearMonths.length > 0
      ? `${allYearMonths[allYearMonths.length - 1].year}-${allYearMonths[allYearMonths.length - 1].month}`
      : ''
  )

  // 날짜 범위에 따른 필터링
  const filteredBalanceSnapshots = useMemo(() => {
    if (!startDate || !endDate) return balanceSnapshots

    const [startYear, startMonth] = startDate.split('-').map(Number)
    const [endYear, endMonth] = endDate.split('-').map(Number)

    return balanceSnapshots.filter((s) => {
      const snapshotDate = s.year * 100 + s.month
      const start = startYear * 100 + startMonth
      const end = endYear * 100 + endMonth
      return snapshotDate >= start && snapshotDate <= end
    })
  }, [balanceSnapshots, startDate, endDate])

  const filteredInvestmentSnapshots = useMemo(() => {
    if (!startDate || !endDate) return investmentSnapshots

    const [startYear, startMonth] = startDate.split('-').map(Number)
    const [endYear, endMonth] = endDate.split('-').map(Number)

    return investmentSnapshots.filter((s) => {
      const snapshotDate = s.year * 100 + s.month
      const start = startYear * 100 + startMonth
      const end = endYear * 100 + endMonth
      return snapshotDate >= start && snapshotDate <= end
    })
  }, [investmentSnapshots, startDate, endDate])

  // 재무상태표 계산 (전월대비 포함)
  const balanceData = useMemo(() => {
    let snapshots = filteredBalanceSnapshots

    // 연도별 뷰인 경우 각 연도의 마지막 월만 선택
    if (viewMode === 'yearly') {
      const yearMap = new Map<number, BalanceSnapshotWithItems>()

      snapshots.forEach((snapshot) => {
        const existing = yearMap.get(snapshot.year)
        if (!existing || snapshot.month > existing.month) {
          yearMap.set(snapshot.year, snapshot)
        }
      })

      snapshots = Array.from(yearMap.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
    }

    const data = snapshots.map((snapshot) => {
      const totalAssets = snapshot.balance_items
        .filter((item) => Number(item.amount) > 0)
        .reduce((sum, item) => sum + Number(item.amount), 0)

      const totalLiabilities = snapshot.balance_items
        .filter((item) => Number(item.amount) < 0)
        .reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0)

      const netAssets = snapshot.balance_items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
      )

      return {
        name: `${snapshot.year}-${snapshot.month}`,
        year: snapshot.year,
        month: snapshot.month,
        totalAssets,
        totalLiabilities,
        netAssets,
      }
    })

    // 전월대비 계산 (데이터가 내림차순이므로 index + 1이 전월)
    return data.map((item, index) => {
      // 마지막 항목(가장 오래된 달)은 전월이 없음
      if (index === data.length - 1) {
        return { ...item, monthOverMonthChange: 0, monthOverMonthRate: 0 }
      }

      const prevNetAssets = data[index + 1].netAssets
      const change = item.netAssets - prevNetAssets
      const rate = prevNetAssets !== 0 ? (change / prevNetAssets) * 100 : 0

      return {
        ...item,
        monthOverMonthChange: change,
        monthOverMonthRate: rate,
      }
    })
  }, [filteredBalanceSnapshots, viewMode])

  // 투자 계산
  const investmentData = useMemo(() => {
    let snapshots = filteredInvestmentSnapshots

    // 연도별 뷰인 경우 각 연도의 마지막 월만 선택
    if (viewMode === 'yearly') {
      const yearMap = new Map<number, InvestmentSnapshotWithItems>()

      snapshots.forEach((snapshot) => {
        const existing = yearMap.get(snapshot.year)
        if (!existing || snapshot.month > existing.month) {
          yearMap.set(snapshot.year, snapshot)
        }
      })

      snapshots = Array.from(yearMap.values()).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
    }

    return snapshots.map((snapshot) => {
      const totalPrincipal = snapshot.investment_items.reduce(
        (sum, item) => sum + Number(item.principal),
        0
      )
      const totalValue = snapshot.investment_items.reduce(
        (sum, item) => sum + Number(item.month_end_value),
        0
      )
      const profitLoss = totalValue - totalPrincipal
      const profitRate =
        totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0

      return {
        name: `${snapshot.year}-${snapshot.month}`,
        year: snapshot.year,
        month: snapshot.month,
        totalPrincipal,
        totalValue,
        profitLoss,
        profitRate,
      }
    })
  }, [filteredInvestmentSnapshots, viewMode])

  // Summary Stats 계산
  const summaryStats = useMemo(() => {
    const latestBalance = balanceData[0]
    const latestInvestment = investmentData[0]

    return {
      netAssets: latestBalance?.netAssets || 0,
      netAssetsChange: latestBalance?.monthOverMonthChange || 0,
      totalInvestment: latestInvestment?.totalValue || 0,
      investmentProfitRate: latestInvestment?.profitRate || 0,
    }
  }, [balanceData, investmentData])

  const checkBalanceSnapshotExists = async (
    year: number,
    month: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/snapshot/check?year=${year}&month=${month}`)
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Failed to check snapshot:', error)
      return false
    }
  }

  const checkInvestmentSnapshotExists = async (
    year: number,
    month: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/snapshot/check-investment?year=${year}&month=${month}`
      )
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Failed to check snapshot:', error)
      return false
    }
  }

  const handleBalanceRowClick = async (year: number, month: number) => {
    const exists = await checkBalanceSnapshotExists(year, month)

    if (!exists) {
      const confirmed = confirm(
        `${year}년 ${month}월 스냅샷이 존재하지 않습니다.\n새로 생성하시겠습니까?`
      )
      if (!confirmed) return
    }

    router.push(`/balance?year=${year}&month=${month}`)
  }

  const handleInvestmentRowClick = async (year: number, month: number) => {
    const exists = await checkInvestmentSnapshotExists(year, month)

    if (!exists) {
      const confirmed = confirm(
        `${year}년 ${month}월 스냅샷이 존재하지 않습니다.\n새로 생성하시겠습니까?`
      )
      if (!confirmed) return
    }

    router.push(`/investment?year=${year}&month=${month}`)
  }

  return (
    <div className="min-h-screen theme-gradient-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              재무 현황을 한눈에 확인하세요
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* 총 순자산 */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">순자산</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-lg font-bold tabular-nums sm:text-2xl">
                  {summaryStats.netAssets.toLocaleString()}
                  <span className="ml-1 text-xs text-muted-foreground sm:text-sm">원</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 전월 대비 */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${summaryStats.netAssetsChange >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {summaryStats.netAssetsChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {viewMode === 'monthly' ? '전월대비' : '전년대비'}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-lg font-bold tabular-nums sm:text-2xl ${
                  summaryStats.netAssetsChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-rose-600 dark:text-rose-500'
                }`}>
                  {summaryStats.netAssetsChange >= 0 ? '+' : ''}
                  {summaryStats.netAssetsChange.toLocaleString()}
                  <span className="ml-1 text-xs sm:text-sm">원</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 총 투자액 */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">총 투자액</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-lg font-bold tabular-nums sm:text-2xl">
                  {summaryStats.totalInvestment.toLocaleString()}
                  <span className="ml-1 text-xs text-muted-foreground sm:text-sm">원</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 투자 수익률 */}
          <Card className="border-border/40 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${summaryStats.investmentProfitRate >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    <TrendingUp className={`h-4 w-4 ${summaryStats.investmentProfitRate >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">수익률</p>
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-lg font-bold tabular-nums sm:text-2xl ${
                  summaryStats.investmentProfitRate >= 0
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : 'text-rose-600 dark:text-rose-500'
                }`}>
                  {summaryStats.investmentProfitRate >= 0 ? '+' : ''}
                  {summaryStats.investmentProfitRate.toFixed(2)}
                  <span className="ml-1 text-xs sm:text-sm">%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balance" className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <TabsList className="inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground sm:h-9">
              <TabsTrigger
                value="balance"
                className="rounded-md px-2 py-1 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-1.5 sm:text-sm"
              >
                자산현황
              </TabsTrigger>
              <TabsTrigger
                value="investment"
                className="rounded-md px-2 py-1 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-1.5 sm:text-sm"
              >
                투자현황
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {/* Date Range Selector */}
              <div className="flex items-center gap-1 rounded-lg border bg-card p-2 shadow-sm">
                <Calendar className="hidden h-4 w-4 text-muted-foreground sm:block" />
                <Select value={startDate} onValueChange={setStartDate}>
                  <SelectTrigger className="h-7 w-[100px] border-0 text-[11px] shadow-none focus:ring-0 sm:h-8 sm:w-[135px] sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allYearMonths.map((ym) => (
                      <SelectItem key={`${ym.year}-${ym.month}`} value={`${ym.year}-${ym.month}`}>
                        {ym.year}년 {ym.month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground sm:text-xs">~</span>
                <Select value={endDate} onValueChange={setEndDate}>
                  <SelectTrigger className="h-7 w-[100px] border-0 text-[11px] shadow-none focus:ring-0 sm:h-8 sm:w-[135px] sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allYearMonths.map((ym) => (
                      <SelectItem key={`${ym.year}-${ym.month}`} value={`${ym.year}-${ym.month}`}>
                        {ym.year}년 {ym.month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
                className="h-8 gap-1.5 px-2.5 text-xs"
                title={viewMode === 'monthly' ? '월별 보기' : '연도별 보기'}
              >
                {viewMode === 'monthly' ? (
                  <>
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">월별</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">연도별</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Balance Tab */}
          <TabsContent value="balance" className="space-y-6">
            {/* Table */}
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead className="h-9 text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          년월
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          총 자산
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          총 부채
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          순자산
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          {viewMode === 'monthly' ? '전월대비' : '전년대비'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64">
                            <div className="flex flex-col items-center justify-center gap-3 text-center">
                              <div className="rounded-full bg-muted p-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">자산 데이터가 없습니다</p>
                                <p className="text-xs text-muted-foreground">
                                  Balance Sheet 페이지에서 자산을 추가해보세요
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/balance')}
                              >
                                자산 추가하기
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        balanceData.map((data) => (
                          <TableRow
                            key={`${data.year}-${data.month}`}
                            className="cursor-pointer border-border/40 transition-colors hover:bg-muted/50"
                            onClick={() => handleBalanceRowClick(data.year, data.month)}
                          >
                            <TableCell className="text-xs font-medium sm:text-sm">
                              {data.year}년 {data.month}월
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums sm:text-sm">
                              {data.totalAssets.toLocaleString()}
                              <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums sm:text-sm">
                              {data.totalLiabilities.toLocaleString()}
                              <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold tabular-nums sm:text-sm">
                              {data.netAssets.toLocaleString()}
                              <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {data.monthOverMonthChange === 0 ? (
                                <span className="text-[10px] text-muted-foreground sm:text-xs">-</span>
                              ) : (
                                <div className="inline-flex flex-col items-end gap-0.5">
                                  <div
                                    className={`flex items-center gap-1 text-xs font-medium tabular-nums sm:text-sm ${
                                      data.monthOverMonthChange >= 0
                                        ? 'text-emerald-600 dark:text-emerald-500'
                                        : 'text-rose-600 dark:text-rose-500'
                                    }`}
                                  >
                                    {data.monthOverMonthChange >= 0 ? (
                                      <TrendingUp className="h-3 w-3" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3" />
                                    )}
                                    {data.monthOverMonthChange >= 0 ? '+' : ''}
                                    {data.monthOverMonthChange.toLocaleString()}
                                  </div>
                                  <div
                                    className={`text-[10px] tabular-nums sm:text-xs ${
                                      data.monthOverMonthChange >= 0
                                        ? 'text-emerald-600/80 dark:text-emerald-500/80'
                                        : 'text-rose-600/80 dark:text-rose-500/80'
                                    }`}
                                  >
                                    {data.monthOverMonthChange >= 0 ? '+' : ''}
                                    {data.monthOverMonthRate.toFixed(2)}%
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            {balanceData.length > 0 && (
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-base font-semibold">순자산 추이</CardTitle>
                  <CardDescription className="text-xs">
                    월별 순자산 변화를 확인하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={balanceData.slice().reverse()}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value) =>
                            typeof value === 'number' ? value.toLocaleString() + '원' : ''
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line
                          type="monotone"
                          dataKey="netAssets"
                          name="순자산"
                          stroke="rgb(16, 185, 129)"
                          strokeWidth={2}
                          dot={{ r: 3, fill: 'rgb(16, 185, 129)' }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="space-y-6">
            {/* Table */}
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead className="h-9 text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          년월
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          총 원금
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          총 평가액
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          평가손익
                        </TableHead>
                        <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                          수익률
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investmentData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-64">
                            <div className="flex flex-col items-center justify-center gap-3 text-center">
                              <div className="rounded-full bg-muted p-4">
                                <PieChart className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">투자 데이터가 없습니다</p>
                                <p className="text-xs text-muted-foreground">
                                  Investment Portfolio 페이지에서 투자를 추가해보세요
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/investment')}
                              >
                                투자 추가하기
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        investmentData.map((data) => (
                          <TableRow
                            key={`${data.year}-${data.month}`}
                            className="cursor-pointer border-border/40 transition-colors hover:bg-muted/50"
                            onClick={() => handleInvestmentRowClick(data.year, data.month)}
                          >
                            <TableCell className="text-xs font-medium sm:text-sm">
                              {data.year}년 {data.month}월
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums sm:text-sm">
                              {data.totalPrincipal.toLocaleString()}
                              <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums sm:text-sm">
                              {data.totalValue.toLocaleString()}
                              <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                            </TableCell>
                            <TableCell
                              className={`text-right text-xs font-medium tabular-nums sm:text-sm ${
                                data.profitLoss >= 0
                                  ? 'text-emerald-600 dark:text-emerald-500'
                                  : 'text-rose-600 dark:text-rose-500'
                              }`}
                            >
                              {data.profitLoss >= 0 ? '+' : ''}
                              {data.profitLoss.toLocaleString()}
                              <span className="ml-0.5 text-[10px] sm:text-xs">원</span>
                            </TableCell>
                            <TableCell
                              className={`text-right text-xs font-semibold tabular-nums sm:text-sm ${
                                data.profitRate >= 0
                                  ? 'text-emerald-600 dark:text-emerald-500'
                                  : 'text-rose-600 dark:text-rose-500'
                              }`}
                            >
                              {data.profitRate >= 0 ? '+' : ''}
                              {data.profitRate.toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            {investmentData.length > 0 && (
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-base font-semibold">수익률 추이</CardTitle>
                  <CardDescription className="text-xs">
                    월별 투자 수익률을 확인하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] w-full sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={investmentData.slice().reverse()}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `${value.toFixed(0)}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          formatter={(value) =>
                            typeof value === 'number' ? `${value.toFixed(2)}%` : ''
                          }
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="profitRate"
                          name="수익률"
                          radius={[4, 4, 0, 0]}
                        >
                          {investmentData.slice().reverse().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.profitRate >= 0 ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
