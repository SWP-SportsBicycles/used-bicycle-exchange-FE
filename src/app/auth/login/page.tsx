import { Suspense } from 'react'
import { LoginScreen } from '@/modules/auth/screens/LoginScreen'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
      <LoginScreen />
    </Suspense>
  )
}
