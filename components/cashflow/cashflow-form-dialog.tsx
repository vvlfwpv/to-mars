'use client'

import { useState, useEffect } from 'react'
import { CashflowItem, CashflowCategory } from '@/types/cashflow'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCashflowItem, updateCashflowItem } from '@/lib/actions/cashflow'
import { useRouter } from 'next/navigation'

type CashflowFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: CashflowItem | null
}

export function CashflowFormDialog({
  open,
  onOpenChange,
  editItem,
}: CashflowFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    owner: '',
    category: '' as CashflowCategory | '',
    item_name: '',
    description: '',
    amount: '',
  })

  useEffect(() => {
    if (editItem) {
      setFormData({
        owner: editItem.owner,
        category: editItem.category,
        item_name: editItem.item_name,
        description: editItem.description || '',
        amount: editItem.amount.toString(),
      })
    } else {
      setFormData({
        owner: '',
        category: '',
        item_name: '',
        description: '',
        amount: '',
      })
    }
  }, [editItem, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editItem) {
        await updateCashflowItem(editItem.id, {
          owner: formData.owner,
          category: formData.category as CashflowCategory,
          item_name: formData.item_name,
          description: formData.description || null,
          amount: Number(formData.amount),
        })
      } else {
        await createCashflowItem({
          owner: formData.owner,
          category: formData.category as CashflowCategory,
          item_name: formData.item_name,
          description: formData.description || null,
          amount: Number(formData.amount),
        })
      }

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save cashflow item:', error)
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
            <Label htmlFor="owner">소유자</Label>
            <Select
              value={formData.owner}
              onValueChange={(value) =>
                setFormData({ ...formData, owner: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="다은">다은</SelectItem>
                <SelectItem value="필제">필제</SelectItem>
                <SelectItem value="공동">공동</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">분류</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as CashflowCategory })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="수입">수입</SelectItem>
                <SelectItem value="고정비">고정비</SelectItem>
                <SelectItem value="비유동투자">비유동투자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_name">항목명</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              placeholder="예: 근로소득, 보험료"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">비고 (선택사항)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="예: DB손보, 새마을공제"
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
              placeholder="100000"
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
