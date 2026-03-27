import { NextResponse } from 'next/server'

/**
 * USD -> KRW 환율 조회
 * 무료 API: https://www.exchangerate-api.com/
 */
export async function GET() {
  try {
    // Open Exchange Rates API (무료, API 키 불필요)
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      // 5분 캐싱
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch exchange rate:', response.status)
      }
      return NextResponse.json(
        { error: 'Failed to fetch exchange rate' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // USD -> KRW 환율 추출
    const usdToKrw = data?.rates?.KRW

    if (typeof usdToKrw !== 'number') {
      return NextResponse.json(
        { error: 'Invalid exchange rate data' },
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
