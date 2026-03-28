import { NextResponse } from 'next/server'
import { getAllBalanceSnapshotsWithItems } from '@/lib/queries/balance'
import { getAllInvestmentSnapshotsWithItems } from '@/lib/queries/investment'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [balanceSnapshots, investmentSnapshots] = await Promise.all([
      getAllBalanceSnapshotsWithItems(),
      getAllInvestmentSnapshotsWithItems(),
    ])
    return NextResponse.json({ balanceSnapshots, investmentSnapshots })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
