'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { BalanceItem, BalanceSnapshotWithItems } from '@/types/balance'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BalanceTable } from './balance-table'
import { BalanceFormDialog } from './balance-form-dialog'
import { BalanceCopyDialog } from './balance-copy-dialog'
import { deleteBalanceItem } from '@/lib/actions/balance'
import { deleteBalanceSnapshot } from '@/lib/actions/snapshot'
import { Plus, Copy, Trash2, Calendar } from 'lucide-react'

type BalancePageClientProps = {
  snapshot: BalanceSnapshotWithItems
  initialYear: number
  initialMonth: number
}

export function BalancePageClient({
  snapshot,
  initialYear,
  initialMonth,
}: BalancePageClientProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<BalanceItem | null>(null)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  const checkSnapshotExists = async (year: number, month: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/snapshot/check?year=${year}&month=${month}`)
      const data = await response.json()
      return data.exists
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to check snapshot:', error)
      }
      return false
    }
  }

  const handleYearChange = async (newYear: string) => {
    const year = parseInt(newYear)
    const exists = await checkSnapshotExists(year, initialMonth)

    if (!exists) {
      const confirmed = confirm(
        `${year}년 ${initialMonth}월 스냅샷이 존재하지 않습니다.\n새로 생성하시겠습니까?`
      )
      if (!confirmed) return
    }

    router.push(`/balance?year=${year}&month=${initialMonth}`)
  }

  const handleMonthChange = async (newMonth: string) => {
    const month = parseInt(newMonth)
    const exists = await checkSnapshotExists(initialYear, month)

    if (!exists) {
      const confirmed = confirm(
        `${initialYear}년 ${month}월 스냅샷이 존재하지 않습니다.\n새로 생성하시겠습니까?`
      )
      if (!confirmed) return
    }

    router.push(`/balance?year=${initialYear}&month=${month}`)
  }

  const handleEdit = (item: BalanceItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteBalanceItem(id)
      toast.success('삭제되었습니다.')
      router.refresh()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete item:', error)
      }
      toast.error('삭제에 실패했습니다.')
    }
  }

  const handleDeleteSnapshot = async () => {
    if (
      !confirm(
        `${initialYear}년 ${initialMonth}월 스냅샷을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    )
      return

    try {
      // 삭제 후 리다이렉트할 URL 받기
      const redirectUrl = await deleteBalanceSnapshot(initialYear, initialMonth)
      toast.success('스냅샷이 삭제되었습니다.')
      // 반환된 URL로 이동 (다른 스냅샷 or dashboard)
      router.push(redirectUrl)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete snapshot:', error)
      }
      toast.error('스냅샷 삭제에 실패했습니다.')
    }
  }

  const handleAddNew = () => {
    setEditItem(null)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen theme-gradient-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Balance Sheet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              재무상태표를 관리하세요
            </p>
          </div>

          {/* Action Buttons and Date Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">항목 추가</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)}>
                <Copy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">다음 달로 복사</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSnapshot}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">스냅샷 삭제</span>
              </Button>
            </div>

            {/* Date Selector */}
            <div className="flex shrink-0 flex-wrap items-center gap-1 rounded-lg border bg-card p-2 shadow-sm sm:gap-2 sm:p-3">
              <Calendar className="hidden h-4 w-4 text-muted-foreground sm:block" />
              <Select value={initialYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="h-7 w-[80px] border-0 text-xs shadow-none focus:ring-0 sm:h-8 sm:w-[120px] sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={initialMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-7 w-[70px] border-0 text-xs shadow-none focus:ring-0 sm:h-8 sm:w-[100px] sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <BalanceTable
          items={snapshot.balance_items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <BalanceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          snapshotId={snapshot.id}
          editItem={editItem}
        />

        <BalanceCopyDialog
          open={copyDialogOpen}
          onOpenChange={setCopyDialogOpen}
          currentYear={initialYear}
          currentMonth={initialMonth}
          items={snapshot.balance_items}
        />
      </div>
    </div>
  )
}
