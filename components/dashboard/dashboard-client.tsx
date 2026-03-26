'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
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
    const data = filteredBalanceSnapshots.map((snapshot) => {
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

    // 전월대비 계산
    return data.map((item, index) => {
      if (index === 0) {
        return { ...item, monthOverMonthChange: 0, monthOverMonthRate: 0 }
      }

      const prevNetAssets = data[index - 1].netAssets
      const change = item.netAssets - prevNetAssets
      const rate = prevNetAssets !== 0 ? (change / prevNetAssets) * 100 : 0

      return {
        ...item,
        monthOverMonthChange: change,
        monthOverMonthRate: rate,
      }
    })
  }, [filteredBalanceSnapshots])

  // 투자 계산
  const investmentData = useMemo(() => {
    return filteredInvestmentSnapshots.map((snapshot) => {
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
  }, [filteredInvestmentSnapshots])

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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">시작:</span>
            <Select value={startDate} onValueChange={setStartDate}>
              <SelectTrigger className="w-32">
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

          <span className="text-sm text-muted-foreground">~</span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">끝:</span>
            <Select value={endDate} onValueChange={setEndDate}>
              <SelectTrigger className="w-32">
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
        </div>
      </div>

      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balance">재무상태표</TabsTrigger>
          <TabsTrigger value="investment">투자</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>년월</TableHead>
                  <TableHead className="text-right">총 자산</TableHead>
                  <TableHead className="text-right">총 부채</TableHead>
                  <TableHead className="text-right">순자산</TableHead>
                  <TableHead className="text-right">전월대비</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  balanceData.map((data) => (
                    <TableRow
                      key={`${data.year}-${data.month}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleBalanceRowClick(data.year, data.month)}
                    >
                      <TableCell>
                        {data.year}년 {data.month}월
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {data.totalAssets.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {data.totalLiabilities.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {data.netAssets.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right">
                        {data.monthOverMonthChange === 0 ? (
                          <span className="text-muted-foreground text-sm">-</span>
                        ) : (
                          <div>
                            <div
                              className={`font-mono text-sm ${
                                data.monthOverMonthChange >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {data.monthOverMonthChange >= 0 ? '+' : ''}
                              {data.monthOverMonthChange.toLocaleString()}원
                            </div>
                            <div
                              className={`text-xs ${
                                data.monthOverMonthChange >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              ({data.monthOverMonthChange >= 0 ? '+' : ''}
                              {data.monthOverMonthRate.toFixed(2)}%)
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

          {balanceData.length > 0 && (
            <div className="rounded-md border p-6">
              <h3 className="text-lg font-semibold mb-4">순자산 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={balanceData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === 'number' ? value.toLocaleString() + '원' : ''
                    }
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="netAssets"
                    name="순자산"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>년월</TableHead>
                  <TableHead className="text-right">총 원금</TableHead>
                  <TableHead className="text-right">총 평가액</TableHead>
                  <TableHead className="text-right">평가손익</TableHead>
                  <TableHead className="text-right">수익률</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investmentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  investmentData.map((data) => (
                    <TableRow
                      key={`${data.year}-${data.month}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleInvestmentRowClick(data.year, data.month)}
                    >
                      <TableCell>
                        {data.year}년 {data.month}월
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {data.totalPrincipal.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {data.totalValue.toLocaleString()}원
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          data.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {data.profitLoss >= 0 ? '+' : ''}
                        {data.profitLoss.toLocaleString()}원
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          data.profitRate >= 0 ? 'text-green-600' : 'text-red-600'
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

          {investmentData.length > 0 && (
            <div className="rounded-md border p-6">
              <h3 className="text-lg font-semibold mb-4">수익률 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={investmentData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === 'number' ? `${value.toFixed(2)}%` : ''
                    }
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="profitRate" name="수익률" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
