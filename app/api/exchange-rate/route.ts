import { NextResponse } from 'next/server'
import { fetchExchangeRate } from '@/lib/services/exchange-rate'
import { EXCHANGE_RATE_API_CONFIG } from '@/lib/constants/investment'

/**
 * USD -> KRW 환율 조회 API 엔드포인트
 * 무료 API: https://www.exchangerate-api.com/
 * 5분 캐싱 적용
 */
export async function GET() {
  try {
    const usdToKrw = await fetchExchangeRate()

    if (!usdToKrw) {
      return NextResponse.json(
        { error: 'Failed to fetch exchange rate' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      rate: usdToKrw,
      base: 'USD',
      target: 'KRW',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching exchange rate:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Next.js 캐싱 설정
export const revalidate = EXCHANGE_RATE_API_CONFIG.CACHE_DURATION
