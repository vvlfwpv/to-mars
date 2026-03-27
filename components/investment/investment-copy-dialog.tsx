'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { InvestmentItem, CreateInvestmentItemInput } from '@/types/investment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { copyInvestmentSnapshotToNextMonth } from '@/lib/actions/snapshot'
import { Plus, Trash2 } from 'lucide-react'

type InvestmentCopyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentYear: number
  currentMonth: number
  items: InvestmentItem[]
}

type CopyItem = CreateInvestmentItemInput & {
  id: string
  selected: boolean
}

export function InvestmentCopyDialog({
  open,
  onOpenChange,
  currentYear,
  currentMonth,
  items,
}: InvestmentCopyDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 다음 달 계산
  const targetMonth = currentMonth === 12 ? 1 : currentMonth + 1
  const targetYear = currentMonth === 12 ? currentYear + 1 : currentYear

  // 복사할 항목들 (모두 선택된 상태로 시작)
  const [copyItems, setCopyItems] = useState<CopyItem[]>([])

  // items가 변경되거나 dialog가 열릴 때마다 초기화
  useEffect(() => {
    if (open) {
      setCopyItems(
        items.map((item) => ({
          id: item.id,
          snapshot_id: '', // 나중에 채워짐
          category: item.category,
          code: item.code,
          name: item.name,
          principal: item.principal,
          month_end_value: item.month_end_value,
          quantity: item.quantity,
          selected: true,
        }))
      )
    }
  }, [open, items])

  const toggleItem = (id: string) => {
    setCopyItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const addNewItem = () => {
    const newItem: CopyItem = {
      id: `new-${Date.now()}`,
      snapshot_id: '',
      category: '',
      code: null,
      name: '',
      principal: 0,
      month_end_value: 0,
      quantity: null,
      selected: true,
    }
    setCopyItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setCopyItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: string | number | null) => {
    setCopyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const handleCopy = async () => {
    const selectedItems = copyItems
      .filter((item) => item.selected)
      .map((item) => ({
        snapshot_id: '', // Server에서 채워짐
        category: item.category,
        code: item.code,
        name: item.name,
        principal: item.principal,
        month_end_value: item.month_end_value,
        quantity: item.quantity,
      }))

    if (selectedItems.length === 0) {
      toast.error('최소 1개 이상의 항목을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      // 다음 달 스냅샷이 이미 있는지 확인
      const checkResponse = await fetch(
        `/api/snapshot/check-investment?year=${targetYear}&month=${targetMonth}`
      )
      const { exists } = await checkResponse.json()

      if (exists) {
        const confirmed = confirm(
          `${targetYear}년 ${targetMonth}월 스냅샷이 이미 존재합니다.\n기존 항목을 모두 삭제하고 덮어쓰시겠습니까?`
        )
        if (!confirmed) {
          setLoading(false)
          return
        }
      }

      const result = await copyInvestmentSnapshotToNextMonth(
        currentYear,
        currentMonth,
        selectedItems,
        true // overwrite = true
      )

      toast.success('복사되었습니다.')
      router.push(`/investment?year=${result.year}&month=${result.month}`)
      router.refresh()
      onOpenChange(false)
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy snapshot:', error)
      }
      toast.error(error.message || '복사에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentYear}년 {currentMonth}월 → {targetYear}년 {targetMonth}월 복사
          </DialogTitle>
          <DialogDescription>
            복사할 항목을 선택하고 내용을 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {copyItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded"
              >
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="대분류"
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                    />
                    <Input
                      placeholder="종목코드"
                      value={item.code || ''}
                      onChange={(e) => updateItem(item.id, 'code', e.target.value || null)}
                    />
                    <Input
                      placeholder="종목명"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="원금"
                      value={item.principal || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'principal', Number(e.target.value))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="월말평가액"
                      value={item.month_end_value || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'month_end_value', Number(e.target.value))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="수량"
                      value={item.quantity || ''}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={addNewItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            항목 추가
          </Button>
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
          <Button onClick={handleCopy} disabled={loading}>
            {loading ? '복사 중...' : '복사 완료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
