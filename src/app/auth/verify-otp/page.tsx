import { Suspense } from 'react'
import { OtpScreen } from '@/modules/auth/screens/OtpScreen'

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
      <OtpScreen />
    </Suspense>
  )
}
