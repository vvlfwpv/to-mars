import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'To Mars - Personal Finance Management',
    short_name: 'To Mars',
    description: 'Track your balance, investments, and cashflow to reach your financial goals',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [],
  }
}
