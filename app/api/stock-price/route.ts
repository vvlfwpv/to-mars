import { NextRequest, NextResponse } from 'next/server'

type StockData = {
  price: number
  symbol: string
  name?: string
}

/**
 * Yahoo Finance에서 주식 데이터 조회
 */
async function fetchYahooStockData(yahooSymbol: string): Promise<StockData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // Yahoo Finance 응답 구조에서 가격과 종목명 추출
    const result = data?.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    const name = result?.meta?.longName || result?.meta?.shortName

    if (typeof price === 'number') {
      return {
        price,
        symbol: yahooSymbol,
        name,
      }
    }

    return null
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error fetching stock data for ${yahooSymbol}:`, error)
    }
    return null
  }
}

/**
 * 한국 주식 가격 조회 (.KS, .KQ 둘 다 시도)
 */
async function fetchKoreanStockPrice(code: string, stockName?: string): Promise<StockData | null> {
  // .KS (KOSPI)와 .KQ (KOSDAQ) 둘 다 시도
  const [ksData, kqData] = await Promise.all([
    fetchYahooStockData(`${code}.KS`),
    fetchYahooStockData(`${code}.KQ`),
  ])

  // 둘 다 실패
  if (!ksData && !kqData) {
    return null
  }

  // 하나만 성공
  if (ksData && !kqData) return ksData
  if (!ksData && kqData) return kqData

  // 둘 다 성공 - 종목명 비교
  if (ksData && kqData && stockName) {
    // 종목명에 Yahoo에서 가져온 이름이 포함되어 있는지 확인
    const ksNameMatch = ksData.name && stockName.includes(ksData.name)
    const kqNameMatch = kqData.name && stockName.includes(kqData.name)

    if (ksNameMatch && !kqNameMatch) return ksData
    if (!ksNameMatch && kqNameMatch) return kqData

    // Yahoo 이름에 DB 종목명이 포함되어 있는지 확인
    const ksNameMatch2 = ksData.name && ksData.name.includes(stockName)
    const kqNameMatch2 = kqData.name && kqData.name.includes(stockName)

    if (ksNameMatch2 && !kqNameMatch2) return ksData
    if (!ksNameMatch2 && kqNameMatch2) return kqData
  }

  // 판단 불가능하면 KOSPI(.KS) 우선
  return ksData

}

/**
 * 주식 가격 조회 (한국/해외 자동 판별)
 */
async function fetchStockPrice(code: string, stockName?: string): Promise<StockData | null> {
  // 이미 suffix가 붙어있으면 그대로 조회
  if (code.includes('.')) {
    return await fetchYahooStockData(code)
  }

  // 숫자로 시작하면 한국 주식
  if (/^\d/.test(code)) {
    return await fetchKoreanStockPrice(code, stockName)
  }

  // 그 외 (미국 주식 등)
  return await fetchYahooStockData(code)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const name = searchParams.get('name') // 종목명 (선택사항)

  if (!code) {
    return NextResponse.json(
      { error: 'Stock code is required' },
      { status: 400 }
    )
  }

  try {
    const stockData = await fetchStockPrice(code, name || undefined)

    if (!stockData) {
      return NextResponse.json(
        { error: 'Failed to fetch stock price' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code,
      price: stockData.price,
      symbol: stockData.symbol,
      name: stockData.name,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get stock price:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
