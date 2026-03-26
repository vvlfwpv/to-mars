'use client'

import { useState, useMemo } from 'react'
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
import type { BalanceSnapshotWithItems } from '@/types/balance'
import type { InvestmentSnapshotWithItems } from '@/types/investment'

type DashboardClientProps = {
  balanceSnapshots: BalanceSnapshotWithItems[]
  investmentSnapshots: InvestmentSnapshotWithItems[]
}

export function DashboardClient({
  balanceSnapshots,
  investmentSnapshots,
}: DashboardClientProps) {
  const [yearFilter, setYearFilter] = useState<string>('all')

  // 연도 목록 추출
  const years = useMemo(() => {
    const balanceYears = balanceSnapshots.map((s) => s.year)
    const investmentYears = investmentSnapshots.map((s) => s.year)
    const allYears = [...new Set([...balanceYears, ...investmentYears])]
    return allYears.sort((a, b) => b - a)
  }, [balanceSnapshots, investmentSnapshots])

  // 필터링된 스냅샷
  const filteredBalanceSnapshots = useMemo(() => {
    if (yearFilter === 'all') return balanceSnapshots
    return balanceSnapshots.filter((s) => s.year === parseInt(yearFilter))
  }, [balanceSnapshots, yearFilter])

  const filteredInvestmentSnapshots = useMemo(() => {
    if (yearFilter === 'all') return investmentSnapshots
    return investmentSnapshots.filter((s) => s.year === parseInt(yearFilter))
  }, [investmentSnapshots, yearFilter])

  // 재무상태표 계산
  const balanceData = useMemo(() => {
    return filteredBalanceSnapshots.map((snapshot) => {
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
        year: snapshot.year,
        month: snapshot.month,
        totalAssets,
        totalLiabilities,
        netAssets,
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
        year: snapshot.year,
        month: snapshot.month,
        totalPrincipal,
        totalValue,
        profitLoss,
        profitRate,
      }
    })
  }, [filteredInvestmentSnapshots])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">연도:</span>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {balanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  balanceData.map((data) => (
                    <TableRow key={`${data.year}-${data.month}`}>
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {balanceData.length > 0 && (
            <div className="rounded-md border p-6">
              <h3 className="text-lg font-semibold mb-4">순자산 추이</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {balanceData.slice().reverse().map((data, index) => {
                  const maxValue = Math.max(...balanceData.map((d) => d.netAssets))
                  const heightPercent = (data.netAssets / maxValue) * 100

                  return (
                    <div
                      key={`${data.year}-${data.month}`}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs font-mono mb-1">
                          {(data.netAssets / 1000000).toFixed(1)}M
                        </span>
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.month}월
                      </div>
                    </div>
                  )
                })}
              </div>
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
                    <TableRow key={`${data.year}-${data.month}`}>
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
              <div className="h-64 flex items-end justify-between gap-2">
                {investmentData.slice().reverse().map((data) => {
                  const isPositive = data.profitRate >= 0
                  const heightPercent = Math.min(Math.abs(data.profitRate) * 2, 100)

                  return (
                    <div
                      key={`${data.year}-${data.month}`}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full flex flex-col items-center">
                        <span
                          className={`text-xs font-mono mb-1 ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {data.profitRate.toFixed(1)}%
                        </span>
                        <div
                          className={`w-full rounded-t ${
                            isPositive ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.month}월
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
