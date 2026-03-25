import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { logout } from './actions'

export default async function Home() {
  const supabase = await createServerClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: snapshots, error } = await supabase
    .from('balance_snapshots')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Household Finance</h1>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <p className="text-red-600">Error loading snapshots: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Balance Snapshots</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">{user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {snapshots && snapshots.length > 0 ? (
        <ul className="space-y-2">
          {snapshots.map((snapshot) => (
            <li key={snapshot.id} className="p-4 border rounded hover:bg-gray-50">
              <span className="font-semibold">{snapshot.year}</span> -
              <span className="ml-2">Month {snapshot.month}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No snapshots found</p>
      )}
    </div>
  )
}
