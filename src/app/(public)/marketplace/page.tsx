import { Suspense } from 'react'
import MarketplaceScreen from '@/modules/buyer/screens/MarketplaceScreen'

export default function Page() {
  return (
    <Suspense>
      <MarketplaceScreen />
    </Suspense>
  )
}
