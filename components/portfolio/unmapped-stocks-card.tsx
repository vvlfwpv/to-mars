'use client'

import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvestmentSnapshotWithItems } from '@/types/investment'
import type { PortfolioSectorWithTargets } from '@/types/portfolio'

type UnmappedStocksCardProps = {
  latestSnapshot: InvestmentSnapshotWithItems
  sectorsWithTargets: PortfolioSectorWithTargets[]
  totalActualValue: number
}

export function UnmappedStocksCard({
  latestSnapshot,
  sectorsWithTargets,
  totalActualValue,
}: UnmappedStocksCardProps) {
  // 포트폴리오 목표에 등록된 종목 코드 Set
  const targetStockCodes = new Set(
    sectorsWithTargets.flatMap((sector) => sector.targets.map((t) => t.stock_code))
  )

  // 실제 보유하고 있지만 목표에 없는 종목들
  const unmappedStocks = latestSnapshot.investment_items.filter(
    (item) => item.code && !targetStockCodes.has(item.code)
  )

  if (unmappedStocks.length === 0) {
    return null
  }

  // 미분류 종목들의 총 비중
  const unmappedTotalWeight = unmappedStocks.reduce(
    (sum, item) =>
      sum + (totalActualValue > 0 ? (Number(item.month_end_value) / totalActualValue) * 100 : 0),
    0
  )

  return (
    <Card className="border-amber-500/40 bg-amber-500/5 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          목표에 없는 보유 종목 ({unmappedTotalWeight.toFixed(1)}%)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unmappedStocks.map((item) => {
            const weight =
              totalActualValue > 0 ? (Number(item.month_end_value) / totalActualValue) * 100 : 0

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-card p-3"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.code} · {item.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold tabular-nums">{weight.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">
                    {Number(item.month_end_value).toLocaleString()}원
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          이 종목들을 포트폴리오 목표에 추가하거나, 매도를 고려하세요.
        </p>
      </CardContent>
    </Card>
  )
}
