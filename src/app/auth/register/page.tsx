import { Suspense } from 'react'
import { RegisterScreen } from '@/modules/auth/screens/RegisterScreen'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-hidden />}>
      <RegisterScreen />
    </Suspense>
  )
}
