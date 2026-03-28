'use client'

import { useState } from 'react'
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
import { inviteUserToGroup } from '@/lib/actions/group'

type GroupInviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
}

export function GroupInviteDialog({ open, onOpenChange, groupId, groupName }: GroupInviteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('이메일을 입력해주세요.')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('올바른 이메일 형식이 아닙니다.')
      return
    }

    setLoading(true)

    try {
      await inviteUserToGroup(groupId, email.trim())
      toast.success('사용자를 초대했습니다.')
      setEmail('')
      onOpenChange(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to invite user:', error)
      }
      const errorMessage = error instanceof Error ? error.message : '초대에 실패했습니다.'

      // Handle specific error cases
      if (errorMessage.includes('not a member')) {
        toast.error('그룹 멤버만 다른 사용자를 초대할 수 있습니다.')
      } else if (errorMessage.includes('not found')) {
        toast.error('해당 이메일을 가진 사용자를 찾을 수 없습니다.')
      } else if (errorMessage.includes('already a member')) {
        toast.error('이미 그룹에 속한 사용자입니다.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그룹에 사용자 초대</DialogTitle>
          <DialogDescription>
            {groupName}에 초대할 사용자의 이메일을 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              autoFocus
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
              {loading ? '초대 중...' : '초대하기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
