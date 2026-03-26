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
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level 1</TableHead>
              <TableHead>Level 2</TableHead>
              <TableHead>Level 3</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  등록된 항목이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.category_level1}</TableCell>
                  <TableCell>{item.category_level2}</TableCell>
                  <TableCell>{item.category_level3}</TableCell>
                  <TableCell className="text-right font-mono">
                    {Number(item.amount).toLocaleString()}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-md border bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>총 자산:</span>
          <span className="font-mono font-semibold">{totalAssets.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>총 부채:</span>
          <span className="font-mono font-semibold">{totalLiabilities.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">순자산:</span>
          <span className={`font-mono font-bold ${netAssets >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netAssets.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  )
}
