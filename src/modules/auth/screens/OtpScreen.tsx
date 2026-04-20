'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import { otpSchema, type OtpFormValues } from '@/modules/auth/schemas/auth-schema'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const RESEND_TIMEOUT_SECONDS = 60

export function OtpScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT_SECONDS)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const emailFromQuery = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: '',
    },
  })

  useEffect(() => {
    if (countdown <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [countdown])

  const onSubmit = async (values: OtpFormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.verifyOtp(values)
      router.push(`/auth/login?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Xac thuc OTP that bai')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    const email = form.getValues('email')
    if (!email || countdown > 0) {
      return
    }

    setIsResending(true)
    setErrorMessage(null)

    try {
      await authApi.resendOtp(email)
      setCountdown(RESEND_TIMEOUT_SECONDS)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gui lai OTP that bai')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Xac thuc OTP' : 'OTP verification'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Nhap ma OTP gom 6 ky tu duoc gui qua email' : 'Enter the 6-digit code sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Xac thuc' : 'Verify'}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-between text-sm">
            <Button variant="ghost" size="sm" onClick={handleResend} disabled={countdown > 0 || isResending}>
              {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {countdown > 0
                ? `${language === 'vi' ? 'Gui lai sau' : 'Resend in'} ${countdown}s`
                : language === 'vi'
                  ? 'Gui lai OTP'
                  : 'Resend OTP'}
            </Button>
            <Link href="/auth/login" className="text-primary hover:underline">
              {language === 'vi' ? 'Quay lai dang nhap' : 'Back to sign in'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
