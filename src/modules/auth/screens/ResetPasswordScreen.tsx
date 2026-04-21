'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/modules/auth/schemas/auth-schema'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function ResetPasswordScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMessage(language === 'vi' ? 'Thieu token khoi phuc mat khau' : 'Missing reset token')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.resetPasswordByLink(token, values)
      router.push('/auth/login')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Dat lai mat khau that bai')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Dat lai mat khau' : 'Reset password'}</CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Nhap mat khau moi va xac nhan de hoan tat'
              : 'Set your new password and confirm to continue'}
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
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'Mat khau moi' : 'New password'}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'Xac nhan mat khau' : 'Confirm password'}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Cap nhat mat khau' : 'Update password'}
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
