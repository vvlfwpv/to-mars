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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createInvestmentItem, updateInvestmentItem } from '@/lib/actions/investment'
import { determineCurrency } from '@/lib/utils/currency'
import { CURRENCY, DEFAULT_CURRENCY } from '@/lib/constants/investment'

const formSchema = z.object({
  category: z.string().min(1, '대분류를 입력해주세요'),
  code: z.string().optional(),
  name: z.string().min(1, '종목명을 입력해주세요'),
  principal: z.number({ message: '숫자를 입력해주세요' }).positive('원금은 0보다 커야 합니다'),
  month_end_value: z.number({ message: '숫자를 입력해주세요' }).nonnegative('월말평가액은 0 이상이어야 합니다'),
  quantity: z.number().optional(),
  currency: z.enum([CURRENCY.KRW, CURRENCY.USD]),
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
      currency: DEFAULT_CURRENCY,
    },
  })

  useEffect(() => {
    if (editItem) {
      const itemCurrency = determineCurrency(editItem)
      form.reset({
        category: editItem.category,
        code: editItem.code || '',
        name: editItem.name,
        principal: editItem.principal,
        month_end_value: editItem.month_end_value,
        quantity: editItem.quantity || undefined,
        currency: itemCurrency,
      })
    } else {
      form.reset({
        category: '',
        code: '',
        name: '',
        principal: 0,
        month_end_value: 0,
        quantity: undefined,
        currency: DEFAULT_CURRENCY,
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
        currency: values.currency,
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save investment item:', error)
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대분류</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 국내주식, 해외주식" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>통화</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="통화 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CURRENCY.KRW}>{CURRENCY.KRW} (원)</SelectItem>
                        <SelectItem value={CURRENCY.USD}>{CURRENCY.USD} (달러)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
