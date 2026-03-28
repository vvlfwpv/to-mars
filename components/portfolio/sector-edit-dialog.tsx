'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PortfolioSectorWithTargets, PortfolioTarget } from '@/types/portfolio'
import {
  createPortfolioSector,
  updatePortfolioSector,
  createPortfolioTarget,
  updatePortfolioTarget,
  deletePortfolioTarget,
} from '@/lib/actions/portfolio'

type SectorEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sector: PortfolioSectorWithTargets | null
}

type TargetForm = {
  id?: string
  stock_code: string
  stock_name: string
  target_weight: string
}

export function SectorEditDialog({ open, onOpenChange, sector }: SectorEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Sector form
  const [sectorName, setSectorName] = useState('')
  const [priority, setPriority] = useState('')
  const [targetWeight, setTargetWeight] = useState('')

  // Targets form
  const [targets, setTargets] = useState<TargetForm[]>([])

  useEffect(() => {
    if (sector) {
      setSectorName(sector.name)
      setPriority(sector.priority.toString())
      setTargetWeight(sector.target_weight.toString())
      setTargets(
        sector.targets.map((t) => ({
          id: t.id,
          stock_code: t.stock_code,
          stock_name: t.stock_name,
          target_weight: t.target_weight.toString(),
        }))
      )
    } else {
      setSectorName('')
      setPriority('')
      setTargetWeight('')
      setTargets([])
    }
  }, [sector, open])

  const addTarget = () => {
    setTargets([...targets, { stock_code: '', stock_name: '', target_weight: '' }])
  }

  const removeTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index))
  }

  const updateTarget = (index: number, field: keyof TargetForm, value: string) => {
    const newTargets = [...targets]
    newTargets[index] = { ...newTargets[index], [field]: value }
    setTargets(newTargets)
  }

  const handleSubmit = async () => {
    // Validation
    if (!sectorName.trim()) {
      toast.error('섹터 이름을 입력해주세요.')
      return
    }
    if (!priority || isNaN(Number(priority))) {
      toast.error('우선순위를 입력해주세요.')
      return
    }
    if (!targetWeight || isNaN(Number(targetWeight))) {
      toast.error('목표 비중을 입력해주세요.')
      return
    }

    for (const target of targets) {
      if (!target.stock_code.trim() || !target.stock_name.trim()) {
        toast.error('모든 종목의 코드와 이름을 입력해주세요.')
        return
      }
      if (!target.target_weight || isNaN(Number(target.target_weight))) {
        toast.error('모든 종목의 목표 비중을 입력해주세요.')
        return
      }
    }

    setLoading(true)

    try {
      if (sector) {
        // Update existing sector
        await updatePortfolioSector(sector.id, {
          name: sectorName.trim(),
          priority: Number(priority),
          target_weight: Number(targetWeight),
        })

        // Update targets
        const existingTargetIds = sector.targets.map((t) => t.id)
        const currentTargetIds = targets.filter((t) => t.id).map((t) => t.id!)

        // Delete removed targets
        const deletedTargetIds = existingTargetIds.filter((id) => !currentTargetIds.includes(id))
        for (const id of deletedTargetIds) {
          await deletePortfolioTarget(id)
        }

        // Update or create targets
        for (const target of targets) {
          if (target.id) {
            // Update existing target
            await updatePortfolioTarget(target.id, {
              stock_code: target.stock_code.trim(),
              stock_name: target.stock_name.trim(),
              target_weight: Number(target.target_weight),
            })
          } else {
            // Create new target
            await createPortfolioTarget({
              sector_id: sector.id,
              stock_code: target.stock_code.trim(),
              stock_name: target.stock_name.trim(),
              target_weight: Number(target.target_weight),
            })
          }
        }

        toast.success('섹터가 수정되었습니다.')
      } else {
        // Create new sector
        const sectorId = await createPortfolioSector({
          name: sectorName.trim(),
          priority: Number(priority),
          target_weight: Number(targetWeight),
        })

        // Create targets for new sector
        for (const target of targets) {
          await createPortfolioTarget({
            sector_id: sectorId,
            stock_code: target.stock_code.trim(),
            stock_name: target.stock_name.trim(),
            target_weight: Number(target.target_weight),
          })
        }

        toast.success('섹터가 추가되었습니다.')
      }

      router.refresh()
      onOpenChange(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save sector:', error)
      }
      toast.error('저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{sector ? '섹터 수정' : '섹터 추가'}</DialogTitle>
          <DialogDescription>
            섹터 정보와 포함될 종목들을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sector Info */}
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="font-semibold">섹터 정보</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label htmlFor="sectorName">섹터 이름</Label>
                <Input
                  id="sectorName"
                  value={sectorName}
                  onChange={(e) => setSectorName(e.target.value)}
                  placeholder="예: 반도체, AI"
                />
              </div>
              <div>
                <Label htmlFor="priority">우선순위</Label>
                <Input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="targetWeight">목표 비중 (%)</Label>
              <Input
                id="targetWeight"
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="16"
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Targets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">종목 목록</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTarget}>
                <Plus className="mr-2 h-4 w-4" />
                종목 추가
              </Button>
            </div>

            {targets.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                추가된 종목이 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {targets.map((target, index) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">종목 {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTarget(index)}
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`code-${index}`} className="text-xs">
                          종목코드
                        </Label>
                        <Input
                          id={`code-${index}`}
                          value={target.stock_code}
                          onChange={(e) => updateTarget(index, 'stock_code', e.target.value)}
                          placeholder="005930"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`name-${index}`} className="text-xs">
                          종목명
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={target.stock_name}
                          onChange={(e) => updateTarget(index, 'stock_name', e.target.value)}
                          placeholder="삼성전자"
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <Label htmlFor={`weight-${index}`} className="text-xs">
                        목표 비중 (%)
                      </Label>
                      <Input
                        id={`weight-${index}`}
                        type="number"
                        value={target.target_weight}
                        onChange={(e) => updateTarget(index, 'target_weight', e.target.value)}
                        placeholder="5"
                        step="0.1"
                        min="0"
                        max="100"
                        className="h-9"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
