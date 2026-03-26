'use client'

import { InvestmentItem } from '@/types/investment'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

type InvestmentTableProps = {
  items: InvestmentItem[]
  onEdit: (item: InvestmentItem) => void
  onDelete: (id: string) => void
}

export function InvestmentTable({ items, onEdit, onDelete }: InvestmentTableProps) {
  // 총계 계산
  const totalPrincipal = items.reduce((sum, item) => sum + Number(item.principal), 0)
  const totalValue = items.reduce((sum, item) => sum + Number(item.month_end_value), 0)
  const profitLoss = totalValue - totalPrincipal
  const profitRate = totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>대분류</TableHead>
              <TableHead>종목코드</TableHead>
              <TableHead>종목명</TableHead>
              <TableHead className="text-right">원금</TableHead>
              <TableHead className="text-right">월말평가액</TableHead>
              <TableHead className="text-right">수량</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  등록된 항목이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const itemProfit = Number(item.month_end_value) - Number(item.principal)
                const itemProfitRate = Number(item.principal) > 0
                  ? (itemProfit / Number(item.principal)) * 100
                  : 0

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.code || '-'}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(item.principal).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div>
                        {Number(item.month_end_value).toLocaleString()}
                      </div>
                      <div className={`text-xs ${itemProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({itemProfit >= 0 ? '+' : ''}{itemProfitRate.toFixed(2)}%)
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.quantity ? Number(item.quantity).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-md border bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>총 원금:</span>
          <span className="font-mono font-semibold">{totalPrincipal.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>총 평가액:</span>
          <span className="font-mono font-semibold">{totalValue.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">평가손익:</span>
          <div className="text-right">
            <div className={`font-mono font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()}원
            </div>
            <div className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({profitLoss >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
