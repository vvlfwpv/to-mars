'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Login] Attempting login for:', data.email)
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login] Error:', error.message)
    }
    redirect('/login?error=Could not authenticate user')
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Login] Success, redirecting to /')
  }
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createServerClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=Could not create user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createServerClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (process.env.NODE_ENV === 'development') {
    console.log('[Google Login] origin:', origin)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Google Login] Error:', error.message)
    }
    redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Google Login] Redirecting to:', data.url)
    }
    redirect(data.url)
  }
}
