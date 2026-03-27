'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Owner } from '@/types/owner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createOwner, updateOwner, deleteOwner } from '@/lib/actions/owner'
import { Pencil, Trash2, Plus } from 'lucide-react'

type OwnerManageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  owners: Owner[]
}

export function OwnerManageDialog({
  open,
  onOpenChange,
  owners: initialOwners,
}: OwnerManageDialogProps) {
  const router = useRouter()
  const [owners, setOwners] = useState<Owner[]>(initialOwners)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newOwnerName, setNewOwnerName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // props가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setOwners(initialOwners)
  }, [initialOwners])

  const handleStartEdit = (owner: Owner) => {
    setEditingId(owner.id)
    setEditingName(owner.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    try {
      await updateOwner(id, { name: editingName.trim() })
      // 로컬 상태 업데이트
      setOwners((prev) =>
        prev.map((o) => (o.id === id ? { ...o, name: editingName.trim() } : o))
      )
      toast.success('수정되었습니다.')
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update owner:', error)
      }
      toast.error('수정에 실패했습니다.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return

    try {
      await deleteOwner(id)
      // 로컬 상태 업데이트
      setOwners((prev) => prev.filter((o) => o.id !== id))
      toast.success('삭제되었습니다.')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to delete owner:', error)
      }
      toast.error('삭제에 실패했습니다. 해당 소유자를 사용 중인 항목이 있을 수 있습니다.')
    }
  }

  const handleAddOwner = async () => {
    if (!newOwnerName.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }

    try {
      await createOwner({ name: newOwnerName.trim() })
      // 임시 owner 추가 (실제 ID는 서버에서 생성되지만, 다이얼로그를 닫을 때 refresh됨)
      const tempOwner: Owner = {
        id: `temp-${Date.now()}`,
        group_id: 'temp', // 임시값, refresh 시 실제값으로 교체됨
        name: newOwnerName.trim(),
        created_at: new Date().toISOString(),
      }
      setOwners((prev) => [...prev, tempOwner])
      toast.success('추가되었습니다.')
      setNewOwnerName('')
      setIsAdding(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create owner:', error)
      }
      toast.error('추가에 실패했습니다.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>소유자 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="flex items-center gap-2 p-3 border rounded-lg"
            >
              {editingId === owner.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(owner.id)
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                  />
                  <Button size="sm" onClick={() => handleSaveEdit(owner.id)}>
                    저장
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{owner.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(owner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(owner.id, owner.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg border-dashed">
              <Input
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                placeholder="새 소유자 이름"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddOwner()
                  if (e.key === 'Escape') {
                    setIsAdding(false)
                    setNewOwnerName('')
                  }
                }}
              />
              <Button size="sm" onClick={handleAddOwner}>
                추가
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setNewOwnerName('')
                }}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              소유자 추가
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
