import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Callback] requestUrl:', requestUrl.href)
    console.log('[Auth Callback] origin:', origin)
    console.log('[Auth Callback] code:', code ? 'exists' : 'missing')
  }

  if (code) {
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth Callback] exchangeCodeForSession result:', {
        success: !!data.session,
        error: error?.message
      })
    }
  }

  // Redirect to home page after successful login
  const redirectUrl = `${origin}/`
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth Callback] redirecting to:', redirectUrl)
  }
  return NextResponse.redirect(redirectUrl)
}
