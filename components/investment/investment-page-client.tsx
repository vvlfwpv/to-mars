'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { InvestmentItem, InvestmentSnapshotWithItems } from '@/types/investment'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InvestmentTable } from './investment-table'
import { InvestmentFormDialog } from './investment-form-dialog'
import { InvestmentCopyDialog } from './investment-copy-dialog'
import { deleteInvestmentItem } from '@/lib/actions/investment'
import { deleteInvestmentSnapshot } from '@/lib/actions/snapshot'
import { Plus, Copy, Trash2, Calendar } from 'lucide-react'

type InvestmentPageClientProps = {
  snapshot: InvestmentSnapshotWithItems
  initialYear: number
  initialMonth: number
}

export function InvestmentPageClient({
  snapshot,
  initialYear,
  initialMonth,
}: InvestmentPageClientProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<InvestmentItem | null>(null)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  const checkSnapshotExists = async (year: number, month: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/snapshot/check-investment?year=${year}&month=${month}`
      )
      const data = await response.json()
      return data.exists
    } catch (error) {
      console.error('Failed to check snapshot:', error)
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

    router.push(`/investment?year=${year}&month=${initialMonth}`)
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

    router.push(`/investment?year=${initialYear}&month=${month}`)
  }

  const handleEdit = (item: InvestmentItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteInvestmentItem(id)
      toast.success('삭제되었습니다.')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete item:', error)
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
      // Dashboard로 먼저 이동 (revalidate로 인한 재생성 방지)
      router.push('/')
      // 이동 후 삭제
      await deleteInvestmentSnapshot(initialYear, initialMonth)
      toast.success('스냅샷이 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete snapshot:', error)
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
              Investment Portfolio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              투자 포트폴리오를 관리하세요
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
        <InvestmentTable
          items={snapshot.investment_items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <InvestmentFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          snapshotId={snapshot.id}
          editItem={editItem}
        />

        <InvestmentCopyDialog
          open={copyDialogOpen}
          onOpenChange={setCopyDialogOpen}
          currentYear={initialYear}
          currentMonth={initialMonth}
          items={snapshot.investment_items}
        />
      </div>
    </div>
  )
}
