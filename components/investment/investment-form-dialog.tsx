'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { InvestmentItem } from '@/types/investment'
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
import { createInvestmentItem, updateInvestmentItem } from '@/lib/actions/investment'

const formSchema = z.object({
  category: z.string().min(1, '대분류를 입력해주세요'),
  code: z.string().optional(),
  name: z.string().min(1, '종목명을 입력해주세요'),
  principal: z.number({ message: '숫자를 입력해주세요' }).positive('원금은 0보다 커야 합니다'),
  month_end_value: z.number({ message: '숫자를 입력해주세요' }).nonnegative('월말평가액은 0 이상이어야 합니다'),
  quantity: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      code: '',
      name: '',
      principal: 0,
      month_end_value: 0,
      quantity: undefined,
    },
  })

  useEffect(() => {
    if (editItem) {
      form.reset({
        category: editItem.category,
        code: editItem.code || '',
        name: editItem.name,
        principal: editItem.principal,
        month_end_value: editItem.month_end_value,
        quantity: editItem.quantity || undefined,
      })
    } else {
      form.reset({
        category: '',
        code: '',
        name: '',
        principal: 0,
        month_end_value: 0,
        quantity: undefined,
      })
    }
  }, [editItem, open, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        category: values.category,
        code: values.code || null,
        name: values.name,
        principal: values.principal,
        month_end_value: values.month_end_value,
        quantity: values.quantity || null,
      }

      if (editItem) {
        await updateInvestmentItem(editItem.id, payload)
      } else {
        await createInvestmentItem({
          snapshot_id: snapshotId,
          ...payload,
        })
      }

      toast.success(editItem ? '수정되었습니다.' : '추가되었습니다.')
      router.refresh()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save investment item:', error)
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대분류</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 한국주식, 미국주식, 미국ETF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종목코드 (선택사항)</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 005930, AAPL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종목명</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 삼성전자, Apple Inc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>원금</FormLabel>
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

              <FormField
                control={form.control}
                name="month_end_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>월말평가액</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1200000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>보유수량 (선택사항)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
