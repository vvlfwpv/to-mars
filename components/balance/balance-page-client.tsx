'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { BalanceItem, BalanceSnapshotWithItems } from '@/types/balance'
import { Button } from '@/components/ui/button'
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
import { Plus, Copy, Trash2 } from 'lucide-react'

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
      await deleteBalanceSnapshot(initialYear, initialMonth)
      toast.success('스냅샷이 삭제되었습니다.')
      // 현재 연월로 이동
      const now = new Date()
      router.push(`/balance?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Balance Sheet</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">년도:</span>
            <Select value={initialYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">월:</span>
            <Select value={initialMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-24">
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

          <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)}>
            <Copy className="h-4 w-4 mr-2" />
            다음 달로 복사
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSnapshot}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            스냅샷 삭제
          </Button>
        </div>
      </div>

      <BalanceTable
        items={snapshot.balance_items}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Button onClick={handleAddNew}>
        <Plus className="h-4 w-4 mr-2" />
        항목 추가
      </Button>

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
  )
}
