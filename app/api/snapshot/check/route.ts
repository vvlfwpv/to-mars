import { NextRequest, NextResponse } from 'next/server'
import { checkBalanceSnapshotExists } from '@/lib/queries/snapshot'
import { createServerClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  // Authentication check
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

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
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to check snapshot:', error)
    }
    return NextResponse.json(
      { error: 'Failed to check snapshot' },
      { status: 500 }
    )
  }
}
