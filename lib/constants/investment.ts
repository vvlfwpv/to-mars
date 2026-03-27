/**
 * Investment 관련 상수 정의
 */

export const INVESTMENT_CATEGORIES = {
  DOMESTIC_STOCK: '국내주식',
  FOREIGN_STOCK: '해외주식',
  FOREIGN_ETF: '해외ETF',
} as const

export const CURRENCY = {
  KRW: 'KRW',
  USD: 'USD',
} as const

export type Currency = typeof CURRENCY[keyof typeof CURRENCY]

/**
 * 해외 투자 카테고리 목록
 */
export const FOREIGN_INVESTMENT_CATEGORIES = [
  INVESTMENT_CATEGORIES.FOREIGN_STOCK,
  INVESTMENT_CATEGORIES.FOREIGN_ETF,
] as const

/**
 * 기본 통화 (원화)
 */
export const DEFAULT_CURRENCY = CURRENCY.KRW

/**
 * 해외 투자 통화 (달러)
 */
export const FOREIGN_CURRENCY = CURRENCY.USD

/**
 * 환율 API 설정
 */
export const EXCHANGE_RATE_API_CONFIG = {
  URL: 'https://open.er-api.com/v6/latest/USD',
  USER_AGENT: 'Mozilla/5.0',
  CACHE_DURATION: 300, // 5분 (초)
} as const
