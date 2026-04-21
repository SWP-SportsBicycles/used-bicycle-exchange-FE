import { Suspense } from 'react'
import { ResetPasswordScreen } from '@/modules/auth/screens/ResetPasswordScreen'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
      <ResetPasswordScreen />
    </Suspense>
  )
}
