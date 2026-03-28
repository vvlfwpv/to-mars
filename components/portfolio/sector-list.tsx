'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { PortfolioSectorWithTargets } from '@/types/portfolio'
import { deletePortfolioSector } from '@/lib/actions/portfolio'
import { useRouter } from 'next/navigation'

type SectorListProps = {
  sectorsWithTargets: PortfolioSectorWithTargets[]
  actualStockMap: Map<string, { value: number; weight: number }>
  totalActualValue: number
  onEditSector: (sector: PortfolioSectorWithTargets) => void
}

export function SectorList({
  sectorsWithTargets,
  actualStockMap,
  totalActualValue,
  onEditSector,
}: SectorListProps) {
  const router = useRouter()
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(
    new Set(sectorsWithTargets.map((s) => s.id))
  )

  const toggleSector = (sectorId: string) => {
    const newExpanded = new Set(expandedSectors)
    if (newExpanded.has(sectorId)) {
      newExpanded.delete(sectorId)
    } else {
      newExpanded.add(sectorId)
    }
    setExpandedSectors(newExpanded)
  }

  const handleDeleteSector = async (sectorId: string, sectorName: string) => {
    if (!confirm(`"${sectorName}" 섹터를 삭제하시겠습니까? (포함된 종목도 함께 삭제됩니다)`))
      return

    try {
      await deletePortfolioSector(sectorId)
      toast.success('섹터가 삭제되었습니다.')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete sector:', error)
      }
      toast.error('섹터 삭제에 실패했습니다.')
    }
  }

  if (sectorsWithTargets.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm">
        <CardContent className="flex h-64 flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium">등록된 섹터가 없습니다</p>
          <p className="text-xs text-muted-foreground">
            상단의 &quot;섹터 추가&quot; 버튼을 클릭하여 포트폴리오를 구성해보세요
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">포트폴리오 목표</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sectorsWithTargets.map((sector) => {
          const isExpanded = expandedSectors.has(sector.id)

          // 섹터의 실제 비중 계산
          const sectorActualWeight = sector.targets.reduce((sum, target) => {
            const actual = actualStockMap.get(target.stock_code)
            return sum + (actual?.weight || 0)
          }, 0)

          const sectorDiff = sectorActualWeight - Number(sector.target_weight)

          return (
            <div key={sector.id} className="border rounded-lg">
              {/* Sector Header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSector(sector.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        우선순위 {sector.priority}
                      </span>
                      <span className="font-semibold">{sector.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      목표 {Number(sector.target_weight).toFixed(1)}% / 실제{' '}
                      {sectorActualWeight.toFixed(1)}%
                      <span
                        className={`ml-2 ${
                          Math.abs(sectorDiff) < 0.01
                            ? 'text-muted-foreground'
                            : sectorDiff > 0
                            ? 'text-rose-600 dark:text-rose-500'
                            : 'text-blue-600 dark:text-blue-500'
                        }`}
                      >
                        ({sectorDiff >= 0 ? '+' : ''}
                        {sectorDiff.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditSector(sector)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSector(sector.id, sector.name)}
                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Sector Targets */}
              {isExpanded && sector.targets.length > 0 && (
                <div className="border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="whitespace-nowrap p-2 text-left text-xs font-medium text-muted-foreground">
                            종목명
                          </th>
                          <th className="whitespace-nowrap p-2 text-right text-xs font-medium text-muted-foreground">
                            목표 비중
                          </th>
                          <th className="whitespace-nowrap p-2 text-right text-xs font-medium text-muted-foreground">
                            실제 비중
                          </th>
                          <th className="whitespace-nowrap p-2 text-right text-xs font-medium text-muted-foreground">
                            실제 금액
                          </th>
                          <th className="whitespace-nowrap p-2 text-right text-xs font-medium text-muted-foreground">
                            차이
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sector.targets.map((target) => {
                          const actual = actualStockMap.get(target.stock_code)
                          const actualWeight = actual?.weight || 0
                          const actualValue = actual?.value || 0
                          const diff = actualWeight - Number(target.target_weight)

                          return (
                            <tr key={target.id} className="border-b last:border-0">
                              <td className="whitespace-nowrap p-2 text-sm">
                                {target.stock_name}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({target.stock_code})
                                </span>
                              </td>
                              <td className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                                {Number(target.target_weight).toFixed(1)}%
                              </td>
                              <td className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                                {actualWeight.toFixed(1)}%
                              </td>
                              <td className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                                {actualValue.toLocaleString()}원
                              </td>
                              <td
                                className={`whitespace-nowrap p-2 text-right text-sm font-medium tabular-nums ${
                                  Math.abs(diff) < 0.01
                                    ? 'text-muted-foreground'
                                    : diff > 0
                                    ? 'text-rose-600 dark:text-rose-500'
                                    : 'text-blue-600 dark:text-blue-500'
                                }`}
                              >
                                {diff >= 0 ? '+' : ''}
                                {diff.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {isExpanded && sector.targets.length === 0 && (
                <div className="border-t p-4 text-center text-sm text-muted-foreground">
                  등록된 종목이 없습니다
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
