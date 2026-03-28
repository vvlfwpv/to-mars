import { Suspense } from 'react'
import { getPortfolioSectorsWithTargets } from '@/lib/queries/portfolio'
import { getLatestInvestmentSnapshot } from '@/lib/queries/investment'
import { PortfolioPageClient } from '@/components/portfolio/portfolio-page-client'
import { Card, CardContent } from '@/components/ui/card'

export default async function PortfolioPage() {
  const [sectorsWithTargets, latestSnapshot] = await Promise.all([
    getPortfolioSectorsWithTargets(),
    getLatestInvestmentSnapshot().catch(() => null),
  ])

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">로딩 중...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PortfolioPageClient
        sectorsWithTargets={sectorsWithTargets}
        latestSnapshot={latestSnapshot}
      />
    </Suspense>
  )
}
