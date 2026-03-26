'use client'

import { useState, useEffect } from 'react'
import { BalanceItem } from '@/types/balance'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBalanceItem, updateBalanceItem } from '@/lib/actions/balance'
import { useRouter } from 'next/navigation'

type BalanceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshotId: string
  editItem?: BalanceItem | null
}

export function BalanceFormDialog({
  open,
  onOpenChange,
  snapshotId,
  editItem,
}: BalanceFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category_level1: '',
    category_level2: '',
    category_level3: '',
    amount: '',
  })

  // Edit 모드일 때 폼 데이터 채우기
  useEffect(() => {
    if (editItem) {
      setFormData({
        category_level1: editItem.category_level1,
        category_level2: editItem.category_level2,
        category_level3: editItem.category_level3,
        amount: editItem.amount.toString(),
      })
    } else {
      setFormData({
        category_level1: '',
        category_level2: '',
        category_level3: '',
        amount: '',
      })
    }
  }, [editItem, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editItem) {
        // 수정
        await updateBalanceItem(editItem.id, {
          category_level1: formData.category_level1,
          category_level2: formData.category_level2,
          category_level3: formData.category_level3,
          amount: Number(formData.amount),
        })
      } else {
        // 생성
        await createBalanceItem({
          snapshot_id: snapshotId,
          category_level1: formData.category_level1,
          category_level2: formData.category_level2,
          category_level3: formData.category_level3,
          amount: Number(formData.amount),
        })
      }

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save balance item:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editItem ? '항목 수정' : '항목 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level1">Category Level 1</Label>
            <Input
              id="level1"
              value={formData.category_level1}
              onChange={(e) =>
                setFormData({ ...formData, category_level1: e.target.value })
              }
              placeholder="예: 자산"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level2">Category Level 2</Label>
            <Input
              id="level2"
              value={formData.category_level2}
              onChange={(e) =>
                setFormData({ ...formData, category_level2: e.target.value })
              }
              placeholder="예: 유동자산"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level3">Category Level 3</Label>
            <Input
              id="level3"
              value={formData.category_level3}
              onChange={(e) =>
                setFormData({ ...formData, category_level3: e.target.value })
              }
              placeholder="예: 예금"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="1000000"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
