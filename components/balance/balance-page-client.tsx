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
import { Plus, Copy } from 'lucide-react'

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

  const handleYearChange = (newYear: string) => {
    router.push(`/balance?year=${newYear}&month=${initialMonth}`)
  }

  const handleMonthChange = (newMonth: string) => {
    router.push(`/balance?year=${initialYear}&month=${newMonth}`)
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
