'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { BalanceItem } from '@/types/balance'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createBalanceItem, updateBalanceItem } from '@/lib/actions/balance'

const formSchema = z.object({
  category_level1: z.string().min(1, '필수 입력 항목입니다'),
  category_level2: z.string().min(1, '필수 입력 항목입니다'),
  category_level3: z.string().min(1, '필수 입력 항목입니다'),
  amount: z.number({ message: '숫자를 입력해주세요' }),
})

type FormValues = z.infer<typeof formSchema>

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_level1: '',
      category_level2: '',
      category_level3: '',
      amount: 0,
    },
  })

  // Edit 모드일 때 폼 데이터 채우기
  useEffect(() => {
    if (editItem) {
      form.reset({
        category_level1: editItem.category_level1,
        category_level2: editItem.category_level2,
        category_level3: editItem.category_level3,
        amount: editItem.amount,
      })
    } else {
      form.reset({
        category_level1: '',
        category_level2: '',
        category_level3: '',
        amount: 0,
      })
    }
  }, [editItem, open, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editItem) {
        await updateBalanceItem(editItem.id, values)
      } else {
        await createBalanceItem({
          snapshot_id: snapshotId,
          ...values,
        })
      }

      toast.success(editItem ? '수정되었습니다.' : '추가되었습니다.')
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save balance item:', error)
      toast.error('저장에 실패했습니다.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editItem ? '항목 수정' : '항목 추가'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_level1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Level 1</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 자산" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_level2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Level 2</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 유동자산" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_level3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Level 3</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 예금" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>금액</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
