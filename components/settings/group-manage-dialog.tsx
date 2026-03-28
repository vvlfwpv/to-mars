'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { createGroup } from '@/lib/actions/group'

type GroupManageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GroupManageDialog({ open, onOpenChange }: GroupManageDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('그룹 이름을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      await createGroup(name.trim(), description.trim() || undefined)
      toast.success('그룹이 생성되었습니다.')
      setName('')
      setDescription('')
      onOpenChange(false)
      router.refresh()
      // 페이지 새로고침으로 새 그룹으로 전환
      window.location.reload()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create group:', error)
      }
      toast.error('그룹 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 그룹 만들기</DialogTitle>
          <DialogDescription>
            가족이나 팀과 함께 사용할 그룹을 만드세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">그룹 이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 우리 가족"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="description">설명 (선택)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="그룹에 대한 설명을 입력하세요"
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
              {loading ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
