'use client'

import { CashflowItem } from '@/types/cashflow'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

type CashflowTableProps = {
  items: CashflowItem[]
  onEdit: (item: CashflowItem) => void
  onDelete: (id: string) => void
}

export function CashflowTable({ items, onEdit, onDelete }: CashflowTableProps) {
  // 오너별로 그룹화
  const owners = ['다은', '필제', '공동']

  // 각 오너별 데이터 계산
  const getOwnerData = (owner: string) => {
    const ownerItems = items.filter((item) => item.owner === owner)

    const income = ownerItems
      .filter((item) => item.category === '수입')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const fixedExpense = ownerItems
      .filter((item) => item.category === '고정비')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const investment = ownerItems
      .filter((item) => item.category === '비유동투자')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    return { items: ownerItems, income, fixedExpense, investment }
  }

  const ownerData = {
    다은: getOwnerData('다은'),
    필제: getOwnerData('필제'),
    공동: getOwnerData('공동'),
  }

  // 전체 합계 계산
  const totalIncome = Object.values(ownerData).reduce(
    (sum, data) => sum + data.income,
    0
  )
  const totalFixedExpense = Object.values(ownerData).reduce(
    (sum, data) => sum + data.fixedExpense,
    0
  )
  const totalInvestment = Object.values(ownerData).reduce(
    (sum, data) => sum + data.investment,
    0
  )
  const savings = totalIncome - totalFixedExpense - totalInvestment
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {owners.map((owner) => {
          const data = ownerData[owner as keyof typeof ownerData]

          return (
            <div key={owner} className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-bold text-center">{owner}</h3>

              {/* 수입 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-green-600">수입</div>
                {data.items
                  .filter((item) => item.category === '수입')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <div>{item.item_name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {Number(item.amount).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                <div className="text-right font-semibold text-sm border-t pt-2">
                  {data.income.toLocaleString()}원
                </div>
              </div>

              {/* 고정비 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-red-600">고정비</div>
                {data.items
                  .filter((item) => item.category === '고정비')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <div>{item.item_name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {Number(item.amount).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                <div className="text-right font-semibold text-sm border-t pt-2">
                  {data.fixedExpense.toLocaleString()}원
                </div>
              </div>

              {/* 비유동투자 */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-blue-600">
                  비유동투자
                </div>
                {data.items
                  .filter((item) => item.category === '비유동투자')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex-1">
                        <div>{item.item_name}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {Number(item.amount).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                <div className="text-right font-semibold text-sm border-t pt-2">
                  {data.investment.toLocaleString()}원
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 전체 합계 */}
      <div className="rounded-md border bg-muted/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>총 수입:</span>
          <span className="font-mono font-semibold text-green-600">
            {totalIncome.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>총 고정비:</span>
          <span className="font-mono font-semibold text-red-600">
            {totalFixedExpense.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>총 비유동투자:</span>
          <span className="font-mono font-semibold text-blue-600">
            {totalInvestment.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">저축액:</span>
          <div className="text-right">
            <div className="font-mono font-bold">
              {savings.toLocaleString()}원
            </div>
            <div className="text-sm text-muted-foreground">
              저축률: {savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
