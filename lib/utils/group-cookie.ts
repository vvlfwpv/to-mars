import { cookies } from 'next/headers'

const GROUP_COOKIE_NAME = 'selected-group-id'
const GROUP_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/**
 * 서버에서 현재 선택된 그룹 ID를 가져옵니다
 */
export async function getSelectedGroupId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(GROUP_COOKIE_NAME)?.value || null
}

/**
 * 서버에서 현재 선택된 그룹 ID를 설정합니다
 */
export async function setSelectedGroupId(groupId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(GROUP_COOKIE_NAME, groupId, {
    maxAge: GROUP_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // 클라이언트에서도 접근 가능
  })
}

/**
 * 클라이언트에서 현재 선택된 그룹 ID를 가져옵니다
 */
export function getSelectedGroupIdClient(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const groupCookie = cookies.find(c => c.trim().startsWith(`${GROUP_COOKIE_NAME}=`))

  if (!groupCookie) return null

  return groupCookie.split('=')[1] || null
}

/**
 * 클라이언트에서 현재 선택된 그룹 ID를 설정합니다
 */
export function setSelectedGroupIdClient(groupId: string): void {
  if (typeof document === 'undefined') return

  document.cookie = `${GROUP_COOKIE_NAME}=${groupId};path=/;max-age=${GROUP_COOKIE_MAX_AGE};samesite=lax`
}
