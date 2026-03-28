'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PortfolioSectorWithTargets } from '@/types/portfolio'
import type { InvestmentSnapshotWithItems } from '@/types/investment'
import { PortfolioChart } from './portfolio-chart'
import { SectorList } from './sector-list'
import { UnmappedStocksCard } from './unmapped-stocks-card'
import { RebalancingGuide } from './rebalancing-guide'
import { SectorEditDialog } from './sector-edit-dialog'

type PortfolioPageClientProps = {
  sectorsWithTargets: PortfolioSectorWithTargets[]
  latestSnapshot: InvestmentSnapshotWithItems | null
}

export function PortfolioPageClient({
  sectorsWithTargets,
  latestSnapshot,
}: PortfolioPageClientProps) {
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<PortfolioSectorWithTargets | null>(null)

  // 실제 포트폴리오 총액 계산
  const totalActualValue = latestSnapshot
    ? latestSnapshot.investment_items.reduce(
        (sum, item) => sum + Number(item.month_end_value),
        0
      )
    : 0

  // 목표 비중 합계
  const totalTargetWeight = sectorsWithTargets.reduce(
    (sum, sector) => sum + Number(sector.target_weight),
    0
  )

  // 실제 비중 계산을 위한 맵 생성
  const actualStockMap = new Map(
    latestSnapshot?.investment_items.map((item) => [
      item.code || '',
      {
        value: Number(item.month_end_value),
        weight: totalActualValue > 0 ? (Number(item.month_end_value) / totalActualValue) * 100 : 0,
      },
    ]) || []
  )

  // 실제 비중 합계 계산
  const totalActualWeight = sectorsWithTargets.reduce((sum, sector) => {
    const sectorActualWeight = sector.targets.reduce((targetSum, target) => {
      const actual = actualStockMap.get(target.stock_code)
      return targetSum + (actual?.weight || 0)
    }, 0)
    return sum + sectorActualWeight
  }, 0)

  // 리밸런싱 필요량
  const rebalancingNeeded = totalTargetWeight - totalActualWeight

  const handleAddSector = () => {
    setEditingSector(null)
    setSectorDialogOpen(true)
  }

  const handleEditSector = (sector: PortfolioSectorWithTargets) => {
    setEditingSector(sector)
    setSectorDialogOpen(true)
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Portfolio</h1>
          <p className="text-sm text-muted-foreground">목표 포트폴리오 관리</p>
        </div>
        <Button onClick={handleAddSector}>
          <Plus className="mr-2 h-4 w-4" />
          섹터 추가
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="space-y-0.5 text-center sm:space-y-1">
              <div className="text-[10px] font-medium text-muted-foreground sm:text-sm">
                목표 총 비중
              </div>
              <div
                className={`text-lg font-bold sm:text-2xl ${
                  Math.abs(totalTargetWeight - 100) > 0.01
                    ? 'text-rose-600 dark:text-rose-500'
                    : 'text-foreground'
                }`}
              >
                {totalTargetWeight.toFixed(1)}%
              </div>
            </div>

            <div className="space-y-0.5 text-center sm:space-y-1">
              <div className="text-[10px] font-medium text-muted-foreground sm:text-sm">
                실제 총 비중
              </div>
              <div className="text-lg font-bold sm:text-2xl">{totalActualWeight.toFixed(1)}%</div>
            </div>

            <div className="space-y-0.5 text-center sm:space-y-1">
              <div className="text-[10px] font-medium text-muted-foreground sm:text-sm">
                리밸런싱 필요
              </div>
              <div
                className={`text-lg font-bold sm:text-2xl ${
                  Math.abs(rebalancingNeeded) > 0.01
                    ? rebalancingNeeded > 0
                      ? 'text-blue-600 dark:text-blue-500'
                      : 'text-amber-600 dark:text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-500'
                }`}
              >
                {rebalancingNeeded >= 0 ? '+' : ''}
                {rebalancingNeeded.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <PortfolioChart
        sectorsWithTargets={sectorsWithTargets}
        actualStockMap={actualStockMap}
      />

      {/* Sector List */}
      <SectorList
        sectorsWithTargets={sectorsWithTargets}
        actualStockMap={actualStockMap}
        totalActualValue={totalActualValue}
        onEditSector={handleEditSector}
      />

      {/* Unmapped Stocks */}
      {latestSnapshot && (
        <UnmappedStocksCard
          latestSnapshot={latestSnapshot}
          sectorsWithTargets={sectorsWithTargets}
          totalActualValue={totalActualValue}
        />
      )}

      {/* Rebalancing Guide */}
      <RebalancingGuide
        sectorsWithTargets={sectorsWithTargets}
        actualStockMap={actualStockMap}
        totalActualValue={totalActualValue}
      />

      {/* Sector Edit Dialog */}
      <SectorEditDialog
        open={sectorDialogOpen}
        onOpenChange={setSectorDialogOpen}
        sector={editingSector}
      />
    </div>
  )
}
