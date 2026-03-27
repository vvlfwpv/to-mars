import type { InvestmentItem } from '@/types/investment'
import {
  FOREIGN_INVESTMENT_CATEGORIES,
  DEFAULT_CURRENCY,
  FOREIGN_CURRENCY,
  type Currency,
} from '@/lib/constants/investment'

/**
 * InvestmentItem의 통화를 판단합니다.
 * currency 필드가 있으면 사용하고, 없으면 카테고리로 판단합니다.
 */
export function determineCurrency(
  item: Pick<InvestmentItem, 'currency' | 'category'>
): Currency {
  // currency 필드가 있으면 그대로 사용
  if (item.currency) {
    return item.currency as Currency
  }

  // currency 필드가 없으면 카테고리로 판단
  return FOREIGN_INVESTMENT_CATEGORIES.includes(item.category as typeof FOREIGN_INVESTMENT_CATEGORIES[number])
    ? FOREIGN_CURRENCY
    : DEFAULT_CURRENCY
}

/**
 * 금액을 환율에 따라 원화로 환산합니다.
 */
export function convertToKRW(
  amount: number,
  currency: Currency,
  exchangeRate: number | null
): number {
  if (currency === 'USD' && exchangeRate) {
    return amount * exchangeRate
  }
  return amount
}

/**
 * 금액을 포맷팅합니다 (소숫점 제거 및 천단위 구분)
 */
export function formatAmount(amount: number): string {
  return Math.floor(amount).toLocaleString()
}

/**
 * 통화 기호를 반환합니다.
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : '원'
}
