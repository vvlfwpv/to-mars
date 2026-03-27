'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CashflowItem } from '@/types/cashflow'
import type { Owner } from '@/types/owner'
import { Button } from '@/components/ui/button'
import { CashflowTable } from './cashflow-table'
import { CashflowFormDialog } from './cashflow-form-dialog'
import { OwnerManageDialog } from './owner-manage-dialog'
import { deleteCashflowItem } from '@/lib/actions/cashflow'
import { Plus, Users } from 'lucide-react'

type CashflowPageClientProps = {
  items: CashflowItem[]
  owners: Owner[]
}

export function CashflowPageClient({ items, owners }: CashflowPageClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<CashflowItem | null>(null)
  const [ownerManageDialogOpen, setOwnerManageDialogOpen] = useState(false)

  const handleOwnerManageDialogChange = (open: boolean) => {
    setOwnerManageDialogOpen(open)
    // 다이얼로그를 닫을 때 페이지 갱신
    if (!open) {
      router.refresh()
    }
  }

  const handleEdit = (item: CashflowItem) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteCashflowItem(id)
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Cashflow
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                현금 흐름을 관리하세요
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddNew} size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">항목 추가</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOwnerManageDialogOpen(true)}>
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">소유자 관리</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <CashflowTable items={items} owners={owners} onEdit={handleEdit} onDelete={handleDelete} />

        <CashflowFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editItem={editItem}
          owners={owners}
        />

        <OwnerManageDialog
          open={ownerManageDialogOpen}
          onOpenChange={handleOwnerManageDialogChange}
          owners={owners}
        />
      </div>
    </div>
  )
}
