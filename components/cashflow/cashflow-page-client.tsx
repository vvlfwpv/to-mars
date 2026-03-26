'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CashflowItem } from '@/types/cashflow'
import { Button } from '@/components/ui/button'
import { CashflowTable } from './cashflow-table'
import { CashflowFormDialog } from './cashflow-form-dialog'
import { deleteCashflowItem } from '@/lib/actions/cashflow'
import { Plus } from 'lucide-react'

type CashflowPageClientProps = {
  items: CashflowItem[]
}

export function CashflowPageClient({ items }: CashflowPageClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<CashflowItem | null>(null)

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

        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          항목 추가
        </Button>
      </div>

      <CashflowTable items={items} onEdit={handleEdit} onDelete={handleDelete} />

      <CashflowFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
      />
    </div>
  )
}
