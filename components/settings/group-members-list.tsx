'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { UserMinus, Mail } from 'lucide-react'
import type { GroupMemberWithEmail } from '@/types/group'
import { removeUserFromGroup } from '@/lib/actions/group'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type GroupMembersListProps = {
  groupId: string
  groupName: string
  members: GroupMemberWithEmail[]
  currentUserId: string
  isSampleGroup: boolean
  onInviteClick: () => void
}

export function GroupMembersList({
  groupId,
  groupName,
  members,
  currentUserId,
  isSampleGroup,
  onInviteClick,
}: GroupMembersListProps) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  const handleRemoveClick = (userId: string) => {
    setRemovingUserId(userId)
    setShowRemoveDialog(true)
  }

  const handleRemoveConfirm = async () => {
    if (!removingUserId) return

    try {
      await removeUserFromGroup(groupId, removingUserId)
      toast.success('멤버를 제거했습니다.')
      setShowRemoveDialog(false)
      setRemovingUserId(null)
      // Reload to update the member list
      window.location.reload()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove user:', error)
      }
      const errorMessage = error instanceof Error ? error.message : '멤버 제거에 실패했습니다.'

      if (errorMessage.includes('sample group')) {
        toast.error('샘플 그룹에서는 멤버를 제거할 수 없습니다.')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">그룹 멤버</h3>
          <p className="text-xs text-muted-foreground">
            {groupName} · {members.length}명
          </p>
        </div>
        {!isSampleGroup && (
          <Button size="sm" variant="outline" onClick={onInviteClick}>
            <Mail className="mr-2 h-4 w-4" />
            초대하기
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <div className="divide-y">
          {members.map((member) => {
            const isCurrentUser = member.user_id === currentUserId

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.user_email}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-muted-foreground">(나)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {!isSampleGroup && !isCurrentUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveClick(member.user_id)}
                    className="ml-2"
                  >
                    <UserMinus className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 제거</AlertDialogTitle>
            <AlertDialogDescription>
              이 사용자를 그룹에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConfirm}>
              제거
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
