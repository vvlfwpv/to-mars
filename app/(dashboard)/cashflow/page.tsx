import { getAllCashflowItems } from '@/lib/queries/cashflow'
import { CashflowPageClient } from '@/components/cashflow/cashflow-page-client'

export default async function CashflowPage() {
  const items = await getAllCashflowItems()

  return <CashflowPageClient items={items} />
}
