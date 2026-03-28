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
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, PiggyBank, Landmark, TrendingUp, PieChart } from 'lucide-react'
import { determineCurrency, convertToKRW, formatAmount, getCurrencySymbol } from '@/lib/utils/currency'
import type { Currency } from '@/lib/constants/investment'

type InvestmentTableProps = {
  items: InvestmentItem[]
  onEdit: (item: InvestmentItem) => void
  onDelete: (id: string) => void
  currentPrices?: Record<string, number>
  exchangeRate?: number | null
}

export function InvestmentTable({ items, onEdit, onDelete, currentPrices = {}, exchangeRate = null }: InvestmentTableProps) {
  // 대분류별 합계 계산
  const categoryStats = items.reduce((acc, item) => {
    const currency = determineCurrency(item)
    const category = item.category

    if (!acc[category]) {
      acc[category] = {
        principal: 0,
        value: 0,
        currency: currency,
      }
    }

    acc[category].principal += Number(item.principal)
    acc[category].value += Number(item.month_end_value)

    return acc
  }, {} as Record<string, { principal: number; value: number; currency: Currency }>)

  // 통화별 합계 계산
  const krwPrincipal = items.reduce((sum, item) => {
    const currency = determineCurrency(item)
    return sum + (currency === 'KRW' ? Number(item.principal) : 0)
  }, 0)
  const usdPrincipal = items.reduce((sum, item) => {
    const currency = determineCurrency(item)
    return sum + (currency === 'USD' ? Number(item.principal) : 0)
  }, 0)
  const krwValue = items.reduce((sum, item) => {
    const currency = determineCurrency(item)
    return sum + (currency === 'KRW' ? Number(item.month_end_value) : 0)
  }, 0)
  const usdValue = items.reduce((sum, item) => {
    const currency = determineCurrency(item)
    return sum + (currency === 'USD' ? Number(item.month_end_value) : 0)
  }, 0)

  // 총계 (원화 환산)
  const totalPrincipal = krwPrincipal + convertToKRW(usdPrincipal, 'USD', exchangeRate)
  const totalValue = krwValue + convertToKRW(usdValue, 'USD', exchangeRate)
  const profitLoss = totalValue - totalPrincipal
  const profitRate = totalPrincipal > 0 ? (profitLoss / totalPrincipal) * 100 : 0

  const hasPrices = Object.keys(currentPrices).length > 0

  return (
    <div className="space-y-4">
      {/* Items Table */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="h-9 whitespace-nowrap text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    대분류
                  </TableHead>
                  <TableHead className="h-9 whitespace-nowrap text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    종목코드
                  </TableHead>
                  <TableHead className="h-9 whitespace-nowrap text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    종목명
                  </TableHead>
                  <TableHead className="h-9 whitespace-nowrap text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    원금
                  </TableHead>
                  <TableHead className="h-9 whitespace-nowrap text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    월말평가액
                  </TableHead>
                  <TableHead className="h-9 whitespace-nowrap text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    수량
                  </TableHead>
                  {hasPrices && (
                    <TableHead className="h-9 whitespace-nowrap text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                      현재가
                    </TableHead>
                  )}
                  <TableHead className="h-9 whitespace-nowrap text-right text-[10px] font-medium text-muted-foreground sm:h-11 sm:text-xs">
                    액션
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={hasPrices ? 8 : 7} className="h-64">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-muted p-4">
                          <PieChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">등록된 항목이 없습니다</p>
                          <p className="text-xs text-muted-foreground">
                            상단의 "항목 추가" 버튼을 클릭하여 투자를 추가해보세요
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const itemProfit = Number(item.month_end_value) - Number(item.principal)
                    const itemProfitRate = Number(item.principal) > 0
                      ? (itemProfit / Number(item.principal)) * 100
                      : 0

                    const itemCurrency = determineCurrency(item)

                    return (
                      <TableRow key={item.id} className="border-border/40">
                        <TableCell className="whitespace-nowrap text-xs sm:text-sm">{item.category}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs sm:text-sm">{item.code || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs sm:text-sm">{item.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-right text-xs tabular-nums sm:text-sm">
                          <div>
                            {itemCurrency === 'USD' && <span className="mr-0.5 text-[10px] text-muted-foreground sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                            {formatAmount(Number(item.principal))}
                            {itemCurrency === 'KRW' && <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                          </div>
                          {itemCurrency === 'USD' && exchangeRate && (
                            <div className="text-[10px] text-muted-foreground sm:text-xs">
                              ≈ {formatAmount(convertToKRW(Number(item.principal), itemCurrency, exchangeRate))}원
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-xs tabular-nums sm:text-sm">
                          <div>
                            {itemCurrency === 'USD' && <span className="mr-0.5 text-[10px] text-muted-foreground sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                            {formatAmount(Number(item.month_end_value))}
                            {itemCurrency === 'KRW' && <span className="ml-0.5 text-[10px] text-muted-foreground sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                          </div>
                          {itemCurrency === 'USD' && exchangeRate && (
                            <div className="text-[10px] text-muted-foreground sm:text-xs">
                              ≈ {formatAmount(convertToKRW(Number(item.month_end_value), itemCurrency, exchangeRate))}원
                            </div>
                          )}
                          <div className={`text-[10px] sm:text-xs ${itemProfit >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                            ({itemProfit >= 0 ? '+' : ''}{itemProfitRate.toFixed(2)}%)
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-xs tabular-nums sm:text-sm">
                          {item.quantity ? Number(item.quantity).toLocaleString() : '-'}
                        </TableCell>
                        {hasPrices && (
                          <TableCell className="whitespace-nowrap text-right text-xs tabular-nums sm:text-sm">
                            {currentPrices[item.id] ? (
                              <div>
                                <div className="text-emerald-600 dark:text-emerald-500">
                                  {itemCurrency === 'USD' && <span className="mr-0.5 text-[10px] sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                                  {formatAmount(currentPrices[item.id])}
                                  {itemCurrency === 'KRW' && <span className="ml-0.5 text-[10px] sm:text-xs">{getCurrencySymbol(itemCurrency)}</span>}
                                </div>
                                {item.quantity && (
                                  <div className="text-[10px] text-muted-foreground sm:text-xs">
                                    → {itemCurrency === 'USD' && getCurrencySymbol(itemCurrency)}{formatAmount(currentPrices[item.id] * item.quantity)}{itemCurrency === 'KRW' && getCurrencySymbol(itemCurrency)}
                                  </div>
                                )}
                                {itemCurrency === 'USD' && exchangeRate && item.quantity && (
                                  <div className="text-[10px] text-muted-foreground sm:text-xs">
                                    ≈ {formatAmount(convertToKRW(currentPrices[item.id] * item.quantity, itemCurrency, exchangeRate))}원
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="whitespace-nowrap text-right">
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-border/40 bg-muted/30 shadow-sm">
        <CardContent className="space-y-3 p-4 sm:p-6">
          {/* 환율 정보 */}
          {exchangeRate && (
            <div className="flex items-center justify-center rounded-lg bg-amber-500/10 px-3 py-2">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400 sm:text-sm">
                환율: 1 USD = {formatAmount(exchangeRate)}원
              </span>
            </div>
          )}

          {/* 대분류별 통계 */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="space-y-1.5 border-b pb-3">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-muted-foreground">{category}</span>
                  <div className="flex gap-3 tabular-nums">
                    <span>
                      {stats.currency === 'USD' && getCurrencySymbol(stats.currency)}
                      {formatAmount(stats.principal)}
                      {stats.currency === 'KRW' && getCurrencySymbol(stats.currency)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">
                      {stats.currency === 'USD' && getCurrencySymbol(stats.currency)}
                      {formatAmount(stats.value)}
                      {stats.currency === 'KRW' && getCurrencySymbol(stats.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 총 원금 */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <PiggyBank className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
              </div>
              <span className="text-muted-foreground">총 원금</span>
            </div>
            <span className="font-semibold tabular-nums">{formatAmount(totalPrincipal)}원</span>
          </div>

          {/* 총 평가액 */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-500/10 p-1.5">
                <Landmark className="h-3.5 w-3.5 text-violet-600 dark:text-violet-500" />
              </div>
              <span className="text-muted-foreground">총 평가액</span>
            </div>
            <span className="font-semibold tabular-nums">{formatAmount(totalValue)}원</span>
          </div>

          {/* 평가손익 */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${profitLoss >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <TrendingUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`} />
              </div>
              <span className="text-sm font-semibold sm:text-base">평가손익</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold tabular-nums sm:text-base ${profitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                {profitLoss >= 0 ? '+' : ''}{formatAmount(profitLoss)}원
              </div>
              <div className={`text-xs tabular-nums sm:text-sm ${profitLoss >= 0 ? 'text-emerald-600/80 dark:text-emerald-500/80' : 'text-rose-600/80 dark:text-rose-500/80'}`}>
                ({profitLoss >= 0 ? '+' : ''}{profitRate.toFixed(2)}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
