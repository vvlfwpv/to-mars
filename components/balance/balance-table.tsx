'use client'

import { BalanceItem } from '@/types/balance'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Wallet, CreditCard, TrendingUp, Plus, FileText } from 'lucide-react'

type BalanceTableProps = {
  items: BalanceItem[]
  onEdit: (item: BalanceItem) => void
  onDelete: (id: string) => void
}

export function BalanceTable({ items, onEdit, onDelete }: BalanceTableProps) {
  // 총계 계산 (양수 = 자산, 음수 = 부채)
  const totalAssets = items
    .filter(item => Number(item.amount) > 0)
    .reduce((sum, item) => sum + Number(item.amount), 0)

  const totalLiabilities = items
    .filter(item => Number(item.amount) < 0)
    .reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0)

  // 순자산 = 모든 항목의 합 (양수 + 음수)
  const netAssets = items.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="space-y-4">
      {/* Items Table */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="h-9 text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    Level 1
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    Level 2
                  </TableHead>
                  <TableHead className="h-9 text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    Level 3
                  </TableHead>
                  <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    금액
                  </TableHead>
                  <TableHead className="h-9 text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    액션
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-muted p-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">등록된 항목이 없습니다</p>
                          <p className="text-xs text-muted-foreground">
                            상단의 "항목 추가" 버튼을 클릭하여 자산을 추가해보세요
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="border-border/40">
                      <TableCell className="text-xs sm:text-sm">{item.category_level1}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{item.category_level2}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{item.category_level3}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums sm:text-sm">
                        {Number(item.amount).toLocaleString()}
                        <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">원</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-border/40 bg-muted/30 shadow-sm">
        <CardContent className="space-y-2 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <span className="text-muted-foreground">총 자산</span>
            </div>
            <span className="font-semibold tabular-nums">{totalAssets.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-rose-500/10 p-1.5">
                <CreditCard className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
              </div>
              <span className="text-muted-foreground">총 부채</span>
            </div>
            <span className="font-semibold tabular-nums">{totalLiabilities.toLocaleString()}원</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${netAssets >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <TrendingUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${netAssets >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`} />
              </div>
              <span className="text-sm font-semibold sm:text-base">순자산</span>
            </div>
            <span className={`text-sm font-bold tabular-nums sm:text-base ${netAssets >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
              {netAssets.toLocaleString()}원
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
