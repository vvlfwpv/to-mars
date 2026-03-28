'use client'

import { ArrowUpRight, ArrowDownRight, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PortfolioSectorWithTargets } from '@/types/portfolio'

type RebalancingGuideProps = {
  sectorsWithTargets: PortfolioSectorWithTargets[]
  actualStockMap: Map<string, { value: number; weight: number }>
  totalActualValue: number
}

type RebalancingItem = {
  stockName: string
  stockCode: string
  sectorName: string
  diff: number
  diffAmount: number
}

export function RebalancingGuide({
  sectorsWithTargets,
  actualStockMap,
  totalActualValue,
}: RebalancingGuideProps) {
  // 리밸런싱 필요 항목 계산
  const rebalancingItems: RebalancingItem[] = []

  sectorsWithTargets.forEach((sector) => {
    sector.targets.forEach((target) => {
      const actual = actualStockMap.get(target.stock_code)
      const actualWeight = actual?.weight || 0
      const diff = actualWeight - Number(target.target_weight)
      const diffAmount = (diff / 100) * totalActualValue

      // 차이가 0.1% 이상인 경우만 포함
      if (Math.abs(diff) >= 0.1) {
        rebalancingItems.push({
          stockName: target.stock_name,
          stockCode: target.stock_code,
          sectorName: sector.name,
          diff,
          diffAmount,
        })
      }
    })
  })

  // 매수 필요 (실제 < 목표)
  const buyList = rebalancingItems.filter((item) => item.diff < 0)
  // 매도 필요 (실제 > 목표)
  const sellList = rebalancingItems.filter((item) => item.diff > 0)

  if (buyList.length === 0 && sellList.length === 0) {
    return (
      <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-sm">
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-center">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              리밸런싱이 필요하지 않습니다
            </p>
            <p className="text-xs text-muted-foreground">
              현재 포트폴리오가 목표와 일치합니다
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          리밸런싱 가이드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 매수 필요 */}
        {buyList.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="h-4 w-4" />
              매수 필요
            </div>
            <div className="space-y-1.5">
              {buyList.map((item) => (
                <div
                  key={item.stockCode}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <div>
                    <div className="font-medium">{item.stockName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sectorName} · {item.stockCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {item.diff.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      약 {Math.abs(item.diffAmount).toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 매도 필요 */}
        {sellList.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
              매도 필요
            </div>
            <div className="space-y-1.5">
              {sellList.map((item) => (
                <div
                  key={item.stockCode}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <div>
                    <div className="font-medium">{item.stockName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sectorName} · {item.stockCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      +{item.diff.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      약 {item.diffAmount.toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
