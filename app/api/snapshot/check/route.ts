import { NextRequest, NextResponse } from 'next/server'
import { checkBalanceSnapshotExists } from '@/lib/queries/snapshot'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  if (!year || !month) {
    return NextResponse.json(
      { error: 'Year and month are required' },
      { status: 400 }
    )
  }

  try {
    const exists = await checkBalanceSnapshotExists(
      parseInt(year),
      parseInt(month)
    )
    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Failed to check snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to check snapshot' },
      { status: 500 }
    )
  }
}
