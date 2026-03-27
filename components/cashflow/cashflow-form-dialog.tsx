'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CashflowItem, CashflowCategory } from '@/types/cashflow'
import { Owner } from '@/types/owner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCashflowItem, updateCashflowItem } from '@/lib/actions/cashflow'

const formSchema = z.object({
  owner: z.string().min(1, '소유자를 선택해주세요'),
  category: z.enum(['수입', '고정비', '비유동투자'], { message: '분류를 선택해주세요' }),
  item_name: z.string().min(1, '항목명을 입력해주세요'),
  description: z.string().optional(),
  amount: z.number({ message: '숫자를 입력해주세요' }).positive('금액은 0보다 커야 합니다'),
})

type FormValues = z.infer<typeof formSchema>

type CashflowFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: CashflowItem | null
  owners: Owner[]
}

export function CashflowFormDialog({
  open,
  onOpenChange,
  editItem,
  owners,
}: CashflowFormDialogProps) {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner: '',
      category: undefined,
      item_name: '',
      description: '',
      amount: 0,
    },
  })

  useEffect(() => {
    if (editItem) {
      form.reset({
        owner: editItem.owner,
        category: editItem.category,
        item_name: editItem.item_name,
        description: editItem.description || '',
        amount: editItem.amount,
      })
    } else {
      form.reset({
        owner: '',
        category: undefined,
        item_name: '',
        description: '',
        amount: 0,
      })
    }
  }, [editItem, open, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        owner: values.owner,
        category: values.category as CashflowCategory,
        item_name: values.item_name,
        description: values.description || null,
        amount: values.amount,
      }

      if (editItem) {
        await updateCashflowItem(editItem.id, payload)
      } else {
        await createCashflowItem(payload)
      }

      toast.success(editItem ? '수정되었습니다.' : '추가되었습니다.')
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save cashflow item:', error)
      }
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
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>소유자</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {owners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.name}>
                          {owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>분류</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="수입">수입</SelectItem>
                      <SelectItem value="고정비">고정비</SelectItem>
                      <SelectItem value="비유동투자">비유동투자</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>항목명</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 근로소득, 보험료" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비고 (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="예: DB손보, 새마을공제" {...field} />
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
                      placeholder="100000"
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
