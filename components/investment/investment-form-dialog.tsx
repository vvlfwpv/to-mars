'use client'

import { useState, useEffect } from 'react'
import { InvestmentItem } from '@/types/investment'
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
import { createInvestmentItem, updateInvestmentItem } from '@/lib/actions/investment'
import { useRouter } from 'next/navigation'

type InvestmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshotId: string
  editItem?: InvestmentItem | null
}

export function InvestmentFormDialog({
  open,
  onOpenChange,
  snapshotId,
  editItem,
}: InvestmentFormDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    code: '',
    name: '',
    principal: '',
    month_end_value: '',
    quantity: '',
  })

  useEffect(() => {
    if (editItem) {
      setFormData({
        category: editItem.category,
        code: editItem.code || '',
        name: editItem.name,
        principal: editItem.principal.toString(),
        month_end_value: editItem.month_end_value.toString(),
        quantity: editItem.quantity?.toString() || '',
      })
    } else {
      setFormData({
        category: '',
        code: '',
        name: '',
        principal: '',
        month_end_value: '',
        quantity: '',
      })
    }
  }, [editItem, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editItem) {
        await updateInvestmentItem(editItem.id, {
          category: formData.category,
          code: formData.code || null,
          name: formData.name,
          principal: Number(formData.principal),
          month_end_value: Number(formData.month_end_value),
          quantity: formData.quantity ? Number(formData.quantity) : null,
        })
      } else {
        await createInvestmentItem({
          snapshot_id: snapshotId,
          category: formData.category,
          code: formData.code || null,
          name: formData.name,
          principal: Number(formData.principal),
          month_end_value: Number(formData.month_end_value),
          quantity: formData.quantity ? Number(formData.quantity) : null,
        })
      }

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save investment item:', error)
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
            <Label htmlFor="category">대분류</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="예: 한국주식, 미국주식, 미국ETF"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">종목코드</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="예: 005930, AAPL (선택사항)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">종목명</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="예: 삼성전자, Apple Inc"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">원금</Label>
              <Input
                id="principal"
                type="number"
                value={formData.principal}
                onChange={(e) =>
                  setFormData({ ...formData, principal: e.target.value })
                }
                placeholder="1000000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month_end_value">월말평가액</Label>
              <Input
                id="month_end_value"
                type="number"
                value={formData.month_end_value}
                onChange={(e) =>
                  setFormData({ ...formData, month_end_value: e.target.value })
                }
                placeholder="1200000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">보유수량 (선택사항)</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder="10"
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
