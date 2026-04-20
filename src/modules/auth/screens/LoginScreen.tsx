'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { loginSchema, type LoginFormValues } from '@/modules/auth/schemas/auth-schema'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

function mapApiRoleToContextRole(role: unknown): UserRole {
  if (role === 2 || role === '2' || role === 'seller') return 'seller'
  if (role === 3 || role === '3' || role === 'inspector') return 'inspector'
  if (role === 4 || role === '4' || role === 'admin') return 'admin'
  if (role === 1 || role === '1' || role === 'buyer') return 'buyer'
  return 'buyer'
}

function setAuthCookies(accessToken: string, role: UserRole) {
  document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=86400; samesite=lax`
  document.cookie = `role=${role}; path=/; max-age=86400; samesite=lax`
}

export function LoginScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const defaultEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const session = await authApi.signin(values)
      localStorage.setItem('accessToken', session.accessToken)
      if (session.refreshToken) {
        localStorage.setItem('refreshToken', session.refreshToken)
      }

      const resolvedRole = mapApiRoleToContextRole(session.user?.role)
      setAuthCookies(session.accessToken, resolvedRole)
      login(resolvedRole)
      router.push(searchParams.get('redirect') ?? '/')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Dang nhap that bai')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Dang nhap' : 'Sign in'}</CardTitle>
          <CardDescription>
            {language === 'vi' ? 'Nhap email va mat khau de tiep tuc' : 'Use your credentials to continue'}
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
                      <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'Mat khau' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Dang nhap' : 'Sign in'}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              {language === 'vi' ? 'Quen mat khau?' : 'Forgot password?'}
            </Link>
            <Link href="/auth/register" className="text-primary hover:underline">
              {language === 'vi' ? 'Tao tai khoan' : 'Create account'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
