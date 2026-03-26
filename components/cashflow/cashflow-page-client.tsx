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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cashflow</h2>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOwnerManageDialogOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            소유자 관리
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            항목 추가
          </Button>
        </div>
      </div>

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
  )
}
