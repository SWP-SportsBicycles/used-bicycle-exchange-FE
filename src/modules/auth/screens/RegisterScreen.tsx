'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import { registerSchema, type RegisterFormValues } from '@/modules/auth/schemas/auth-schema'
import { useLanguage } from '@/lib/language-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

function PasswordRule({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {valid ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className={valid ? 'text-green-700' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}

export function RegisterScreen() {
  const router = useRouter()
  const { language } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      role: '2',
    },
  })

  const password = useWatch({ control: form.control, name: 'password' }) ?? ''
  const checks = useMemo(
    () => ({
      upper: /[A-Z]/.test(password),
      digit: /\d/.test(password),
      special: /[\W_]/.test(password),
      length: password.length >= 6,
    }),
    [password],
  )

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.signup({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: Number(values.role) as 1 | 2,
      })

      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Dang ky that bai')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Dang ky tai khoan' : 'Create account'}</CardTitle>
          <CardDescription>
            {language === 'vi'
              ? 'Hoan tat thong tin de bat dau mua ban xe dap'
              : 'Complete your details to start trading bikes'}
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'Ho va ten' : 'Full name'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'vi' ? 'Nguyen Van A' : 'John Doe'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'So dien thoai' : 'Phone number'}</FormLabel>
                    <FormControl>
                      <Input placeholder="09xxxxxxxx" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'vi' ? 'Vai tro' : 'Role'}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'vi' ? 'Chon vai tro' : 'Select role'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{language === 'vi' ? 'Nguoi mua' : 'Buyer'}</SelectItem>
                        <SelectItem value="2">{language === 'vi' ? 'Nguoi ban' : 'Seller'}</SelectItem>
                      </SelectContent>
                    </Select>
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
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-md border bg-muted/40 p-3">
                <p className="mb-2 text-xs font-medium">{language === 'vi' ? 'Yeu cau mat khau' : 'Password requirements'}</p>
                <div className="space-y-1">
                  <PasswordRule valid={checks.upper} label={language === 'vi' ? 'Co chu hoa' : 'Has uppercase letter'} />
                  <PasswordRule valid={checks.digit} label={language === 'vi' ? 'Co chu so' : 'Has digit'} />
                  <PasswordRule valid={checks.special} label={language === 'vi' ? 'Co ky tu dac biet' : 'Has special character'} />
                  <PasswordRule valid={checks.length} label={language === 'vi' ? 'Toi thieu 6 ky tu' : 'At least 6 characters'} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'vi' ? 'Dang ky' : 'Register'}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-primary hover:underline">
              {language === 'vi' ? 'Da co tai khoan? Dang nhap' : 'Already have an account? Sign in'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
