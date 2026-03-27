import { EXCHANGE_RATE_API_CONFIG } from '@/lib/constants/investment'

/**
 * 환율 조회 서비스
 * USD to KRW 환율을 조회합니다.
 */
export async function fetchExchangeRate(): Promise<number | null> {
  try {
    const response = await fetch(EXCHANGE_RATE_API_CONFIG.URL, {
      headers: {
        'User-Agent': EXCHANGE_RATE_API_CONFIG.USER_AGENT,
      },
    })

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch exchange rate:', response.status)
      }
      return null
    }

    const data = await response.json()
    const usdToKrw = data?.rates?.KRW

    if (typeof usdToKrw !== 'number') {
      if (process.env.NODE_ENV === 'development') {
        console.error('Invalid exchange rate data')
      }
      return null
    }

    return usdToKrw
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching exchange rate:', error)
    }
    return null
  }
}
