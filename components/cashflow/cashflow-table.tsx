'use client'

import { CashflowItem } from '@/types/cashflow'
import { Owner } from '@/types/owner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Wallet, CreditCard, PiggyBank, TrendingUp } from 'lucide-react'

type CashflowTableProps = {
  items: CashflowItem[]
  owners: Owner[]
  onEdit: (item: CashflowItem) => void
  onDelete: (id: string) => void
}

export function CashflowTable({ items, owners, onEdit, onDelete }: CashflowTableProps) {
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

  // 동적으로 ownerData 생성
  const ownerDataMap = new Map(
    owners.map((owner) => [owner.name, getOwnerData(owner.name)])
  )

  // 전체 합계 계산
  const totalIncome = Array.from(ownerDataMap.values()).reduce(
    (sum, data) => sum + data.income,
    0
  )
  const totalFixedExpense = Array.from(ownerDataMap.values()).reduce(
    (sum, data) => sum + data.fixedExpense,
    0
  )
  const totalInvestment = Array.from(ownerDataMap.values()).reduce(
    (sum, data) => sum + data.investment,
    0
  )
  const savings = totalIncome - totalFixedExpense - totalInvestment
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card - Mobile First */}
      <Card className="order-1 border-border/40 bg-muted/30 shadow-sm md:order-2">
        <CardContent className="space-y-2 p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
              </div>
              <span className="text-muted-foreground">총 수입</span>
            </div>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-500">
              {totalIncome.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-rose-500/10 p-1.5">
                <CreditCard className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500" />
              </div>
              <span className="text-muted-foreground">총 고정비</span>
            </div>
            <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-500">
              {totalFixedExpense.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <PiggyBank className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
              </div>
              <span className="text-muted-foreground">총 비유동투자</span>
            </div>
            <span className="font-semibold tabular-nums text-blue-600 dark:text-blue-500">
              {totalInvestment.toLocaleString()}원
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-500/10 p-1.5">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-600 dark:text-violet-500" />
              </div>
              <span className="text-sm font-semibold sm:text-base">저축액</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums sm:text-base">
                {savings.toLocaleString()}원
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                저축률: {savingsRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner Cards */}
      <div className="order-2 grid grid-cols-1 gap-4 md:order-1 md:grid-cols-2 lg:grid-cols-3">
        {owners.map((owner) => {
          const data = ownerDataMap.get(owner.name)
          if (!data) return null

          return (
            <Card key={owner.id} className="border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-base sm:text-lg">{owner.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 수입 */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 sm:text-sm">수입</div>
                  {data.items
                    .filter((item) => item.category === '수입')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{item.item_name}</div>
                          {item.description && (
                            <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-xs tabular-nums sm:text-sm">
                            {Number(item.amount).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  <div className="border-t pt-2 text-right text-xs font-semibold tabular-nums sm:text-sm">
                    {data.income.toLocaleString()}원
                  </div>
                </div>

                {/* 고정비 */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-500 sm:text-sm">고정비</div>
                  {data.items
                    .filter((item) => item.category === '고정비')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{item.item_name}</div>
                          {item.description && (
                            <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-xs tabular-nums sm:text-sm">
                            {Number(item.amount).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  <div className="border-t pt-2 text-right text-xs font-semibold tabular-nums sm:text-sm">
                    {data.fixedExpense.toLocaleString()}원
                  </div>
                </div>

                {/* 비유동투자 */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-500 sm:text-sm">
                    비유동투자
                  </div>
                  {data.items
                    .filter((item) => item.category === '비유동투자')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate">{item.item_name}</div>
                          {item.description && (
                            <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-xs tabular-nums sm:text-sm">
                            {Number(item.amount).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  <div className="border-t pt-2 text-right text-xs font-semibold tabular-nums sm:text-sm">
                    {data.investment.toLocaleString()}원
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
