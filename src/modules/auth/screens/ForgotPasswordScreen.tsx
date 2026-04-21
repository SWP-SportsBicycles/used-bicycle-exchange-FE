'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/modules/auth/schemas/auth-schema'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function ForgotPasswordScreen() {
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.forgotPassword(values.email)
      setSubmittedEmail(values.email)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the gui email khoi phuc')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Quen mat khau' : 'Forgot password'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Nhap email de nhan lien ket dat lai mat khau' : 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {submittedEmail && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {language === 'vi'
                  ? `Da gui lien ket khoi phuc den ${submittedEmail}`
                  : `Reset link sent to ${submittedEmail}`}
              </AlertDescription>
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
                      <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Gui lien ket khoi phuc' : 'Send reset link'}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              {language === 'vi' ? 'Quay lai dang nhap' : 'Back to sign in'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
