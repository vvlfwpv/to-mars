'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { PortfolioSectorWithTargets } from '@/types/portfolio'

type PortfolioChartProps = {
  sectorsWithTargets: PortfolioSectorWithTargets[]
  actualStockMap: Map<string, { value: number; weight: number }>
}

const COLORS = [
  'rgb(59, 130, 246)',   // blue
  'rgb(139, 92, 246)',   // violet
  'rgb(236, 72, 153)',   // pink
  'rgb(234, 179, 8)',    // yellow
  'rgb(34, 197, 94)',    // green
  'rgb(249, 115, 22)',   // orange
  'rgb(239, 68, 68)',    // red
  'rgb(20, 184, 166)',   // teal
  'rgb(168, 85, 247)',   // purple
  'rgb(14, 165, 233)',   // sky
]

export function PortfolioChart({ sectorsWithTargets, actualStockMap }: PortfolioChartProps) {
  const [viewMode, setViewMode] = useState<'sector' | 'stock'>('sector')

  // 섹터별 데이터
  const sectorData = sectorsWithTargets.map((sector, index) => ({
    name: sector.name,
    value: Number(sector.target_weight),
    color: COLORS[index % COLORS.length],
  }))

  // 종목별 데이터
  const stockData = sectorsWithTargets.flatMap((sector, sectorIndex) =>
    sector.targets.map((target, targetIndex) => ({
      name: target.stock_name,
      value: Number(target.target_weight),
      color: COLORS[(sectorIndex * 3 + targetIndex) % COLORS.length],
    }))
  )

  const data = viewMode === 'sector' ? sectorData : stockData

  if (data.length === 0) {
    return null
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {viewMode === 'sector' ? '섹터별' : '종목별'} 목표 비중
            </CardTitle>
            <CardDescription className="text-xs">
              {viewMode === 'sector' ? '섹터별' : '종목별'} 목표 포트폴리오 구성
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'sector' ? 'default' : 'outline'}
              onClick={() => setViewMode('sector')}
            >
              섹터별
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'stock' ? 'default' : 'outline'}
              onClick={() => setViewMode('stock')}
            >
              종목별
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  value > 3 ? `${name} ${value.toFixed(1)}%` : ''
                }
                outerRadius={window.innerWidth < 640 ? 80 : 120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => `${Number(value).toFixed(2)}%`}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, entry) => {
                  const data = entry.payload as { value: number }
                  return `${value} (${data.value.toFixed(1)}%)`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
