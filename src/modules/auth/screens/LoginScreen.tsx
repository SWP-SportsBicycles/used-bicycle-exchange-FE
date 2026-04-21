'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth-api'
import type { AuthSession } from '@/lib/api/auth-api'
import { useAuth } from '@/lib/auth-context'
import type { AuthRole } from '@/lib/api/auth-api'
import { sellerShippingApi } from '@/lib/api/sellerShippingApi'
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/modules/auth/schemas/auth-schema'
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
import { cn } from '@/lib/utils'

type AuthMode = 'login' | 'register'
type GoogleIntent = 'login' | 'register'

const AUTH_DECOR_IMAGE =
  'https://www.theproscloset.com/cdn/shop/t/866/assets/login-modal-img.webp?v=130212517508398775691771966687'

function PasswordRule({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {valid ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className={valid ? 'text-green-700' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}

export function LoginScreen({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithSession } = useAuth()
  const { language } = useLanguage()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null)
  const [registerErrorMessage, setRegisterErrorMessage] = useState<string | null>(null)
  const [isHandlingGoogleCallback, setIsHandlingGoogleCallback] = useState(false)
  const [pendingGoogleIdToken, setPendingGoogleIdToken] = useState<string | null>(null)
  const [pendingGoogleIntent, setPendingGoogleIntent] = useState<GoogleIntent | null>(null)
  const [pendingGoogleRole, setPendingGoogleRole] = useState<'1' | '2'>('1')
  const hasGoogleClientId = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)

  const defaultEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const redirectTarget = useMemo(() => searchParams.get('redirect') ?? '/', [searchParams])

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: defaultEmail,
      password: '',
      role: '2',
    },
  })

  const registerPassword = useWatch({ control: registerForm.control, name: 'password' }) ?? ''
  const registerRole = useWatch({ control: registerForm.control, name: 'role' }) ?? '2'
  const checks = useMemo(
    () => ({
      upper: /[A-Z]/.test(registerPassword),
      digit: /\d/.test(registerPassword),
      special: /[\W_]/.test(registerPassword),
      length: registerPassword.length >= 6,
    }),
    [registerPassword],
  )

  const mapAuthRoleToContextRole = (role: unknown): 'buyer' | 'seller' | 'inspector' | 'admin' | null => {
    const normalized = typeof role === 'string' ? role.trim().toLowerCase() : role
    if (normalized === 1 || normalized === '1' || normalized === 'buyer') return 'buyer'
    if (normalized === 2 || normalized === '2' || normalized === 'seller') return 'seller'
    if (normalized === 3 || normalized === '3' || normalized === 'inspector') return 'inspector'
    if (normalized === 4 || normalized === '4' || normalized === 'admin') return 'admin'
    return null
  }

  const isShippingProfileMissingError = (error: unknown) => {
    if (!(error instanceof Error)) return false
    const message = error.message.toLowerCase()
    return message.includes('not found') || message.includes('404')
  }

  const resolvePostLoginDestination = useCallback(async (session?: AuthSession, roleHint?: AuthRole) => {
    const resolvedRole =
      mapAuthRoleToContextRole(session?.user?.role) ??
      mapAuthRoleToContextRole(roleHint)

    if (resolvedRole !== 'seller') {
      return redirectTarget
    }

    try {
      await sellerShippingApi.getMyProfile()
      return redirectTarget
    } catch (error) {
      if (isShippingProfileMissingError(error)) {
        return `/seller/shipping-profile?redirect=${encodeURIComponent(redirectTarget)}`
      }
      return redirectTarget
    }
  }, [redirectTarget])

  const resetPendingGoogle = () => {
    setPendingGoogleIdToken(null)
    setPendingGoogleIntent(null)
  }

  const onModeChange = (nextMode: AuthMode) => {
    setMode(nextMode)
    resetPendingGoogle()
  }

  useEffect(() => {
    const callbackFlag = searchParams.get('googleCallback')
    const accessToken = searchParams.get('accessToken') ?? searchParams.get('token')

    if (!callbackFlag || !accessToken || isHandlingGoogleCallback) {
      return
    }

    const rawRole = searchParams.get('role') ?? searchParams.get('userRole')
    const numericRole = Number(rawRole)
    const normalizedRole: AuthRole | undefined =
      numericRole === 1 || numericRole === 2 || numericRole === 3 || numericRole === 4
        ? (numericRole as AuthRole)
        : undefined

    const fallbackName = searchParams.get('fullName') ?? searchParams.get('name') ?? undefined
    const fallbackEmail = searchParams.get('email') ?? undefined

    const run = async () => {
      setIsHandlingGoogleCallback(true)
      setLoginErrorMessage(null)
      setRegisterErrorMessage(null)

      try {
        await loginWithSession({
          accessToken,
          refreshToken: searchParams.get('refreshToken') ?? undefined,
          user: {
            fullName: fallbackName,
            email: fallbackEmail,
            role: normalizedRole,
          },
        })

        const destination = await resolvePostLoginDestination(undefined, normalizedRole)
        router.replace(destination)
      } catch {
        const message = language === 'vi' ? 'Dang nhap Google that bai' : 'Google sign-in failed'
        setLoginErrorMessage(message)
        setRegisterErrorMessage(message)
      } finally {
        setIsHandlingGoogleCallback(false)
      }
    }

    void run()
  }, [
    isHandlingGoogleCallback,
    language,
    loginWithSession,
    redirectTarget,
    resolvePostLoginDestination,
    router,
    searchParams,
  ])

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoginSubmitting(true)
    setLoginErrorMessage(null)

    try {
      const session = await authApi.signin(values)
      await loginWithSession(session)
      const destination = await resolvePostLoginDestination(session)
      router.push(destination)
    } catch (error) {
      setLoginErrorMessage(error instanceof Error ? error.message : 'Đăng nhập thất bại')
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsRegisterSubmitting(true)
    setRegisterErrorMessage(null)

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingAuthRole', Number(values.role) === 2 ? 'seller' : 'buyer')
      }

      await authApi.signup({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: Number(values.role) as 1 | 2,
      })
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      setRegisterErrorMessage(error instanceof Error ? error.message : 'Đăng ký thất bại')
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const submitGoogleSession = async (idToken: string, role: AuthRole, target: GoogleIntent) => {
    setLoginErrorMessage(null)
    setRegisterErrorMessage(null)
    setIsGoogleSubmitting(true)

    try {
      const session = await authApi.googleLogin(idToken, role)
      await loginWithSession(session)
      const destination = await resolvePostLoginDestination(session, role)
      router.push(destination)
      return true
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : language === 'vi'
            ? 'Dang nhap Google that bai'
            : 'Google sign-in failed'

      if (target === 'login') {
        setLoginErrorMessage(message)
      } else {
        setRegisterErrorMessage(message)
      }
      return false
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const onGoogleSubmit = async (response: CredentialResponse, target: GoogleIntent) => {
    const idToken = response.credential
    if (!idToken) {
      const message = language === 'vi' ? 'Khong nhan duoc token Google' : 'Unable to read Google token'
      if (target === 'login') {
        setLoginErrorMessage(message)
      } else {
        setRegisterErrorMessage(message)
      }
      return
    }

    setPendingGoogleIdToken(idToken)
    setPendingGoogleIntent(target)
    setPendingGoogleRole(target === 'register' && registerRole === '2' ? '2' : '1')

    if (target === 'login') {
      setLoginErrorMessage(null)
    } else {
      setRegisterErrorMessage(null)
    }
  }

  const onConfirmGoogleLoginRole = async () => {
    if (!pendingGoogleIdToken || !pendingGoogleIntent) return
    const role = pendingGoogleRole === '2' ? 2 : 1
    const success = await submitGoogleSession(pendingGoogleIdToken, role, pendingGoogleIntent)

    if (success) {
      resetPendingGoogle()
    }
  }

  return (
    <section className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10 md:px-10">
      <Link href="/" className="fixed left-4 top-4 z-30 inline-flex items-center gap-2.5 group sm:left-6 sm:top-6 md:left-10 md:top-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-athletic transition-all duration-300 group-hover:scale-105">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-primary-foreground"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="5.5" cy="17.5" r="3.5" />
            <circle cx="18.5" cy="17.5" r="3.5" />
            <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
          </svg>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-archivo)' }}>
          SBE
        </span>
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_24px_64px_rgba(0,0,0,0.22)] md:grid-cols-[1.55fr_1fr]">
          <div className="relative min-h-[300px] md:min-h-[680px]">
            <Image src={AUTH_DECOR_IMAGE} alt="" fill priority className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 62vw" />
            <div className="absolute inset-0 bg-black/35" />
          </div>

          <div className="bg-card px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle>{language === 'vi' ? 'Tài khoản' : 'Account'}</CardTitle>
                <CardDescription className="text-foreground/70">
                  {language === 'vi'
                    ? 'Đăng nhập hoặc đăng ký để tiếp tục mua bán xe đạp'
                    : 'Sign in or create an account to continue'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0">
                <div className="relative grid grid-cols-2 rounded-lg bg-muted p-1">
                  <div
                    className={cn(
                      'absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-md bg-background shadow-sm transition-transform duration-300',
                      mode === 'login' ? 'translate-x-0' : 'translate-x-full',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => onModeChange('login')}
                    className={cn(
                      'z-10 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      mode === 'login' ? 'text-foreground' : 'text-foreground/70',
                    )}
                  >
                    {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onModeChange('register')}
                    className={cn(
                      'z-10 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      mode === 'register' ? 'text-foreground' : 'text-foreground/70',
                    )}
                  >
                    {language === 'vi' ? 'Đăng ký' : 'Register'}
                  </button>
                </div>

                <div className="overflow-hidden">
                  <motion.div
                    className="flex w-[200%]"
                    animate={{ x: mode === 'login' ? '0%' : '-50%' }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                  >
                    <div className="w-1/2 pr-2">
                      {loginErrorMessage && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{loginErrorMessage}</AlertDescription>
                        </Alert>
                      )}

                      <Form {...loginForm}>
                        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                          <FormField
                            control={loginForm.control}
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
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === 'vi' ? 'Mật khẩu' : 'Password'}</FormLabel>
                                <FormControl>
                                  <Input placeholder="••••••••" type="password" autoComplete="current-password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full" disabled={isLoginSubmitting}>
                            {isLoginSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
                          </Button>

                          <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border/70" />
                            </div>
                            <span className="relative mx-auto block w-fit bg-card px-2 text-xs text-foreground/60">
                              {language === 'vi' ? 'Hoac' : 'Or'}
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isGoogleSubmitting || isHandlingGoogleCallback}
                          >
                            <div className={cn('flex w-full items-center justify-center', isGoogleSubmitting && 'pointer-events-none opacity-70')}>
                              {isGoogleSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>{language === 'vi' ? 'Dang xu ly Google...' : 'Processing Google...'}</span>
                                </>
                              ) : (
                                hasGoogleClientId ? (
                                  <GoogleLogin
                                    onSuccess={(response) => {
                                      void onGoogleSubmit(response, 'login')
                                    }}
                                    onError={() => {
                                      const message = language === 'vi' ? 'Dang nhap Google that bai' : 'Google sign-in failed'
                                      setLoginErrorMessage(message)
                                    }}
                                    text="signin_with"
                                    shape="pill"
                                    size="large"
                                    width="320"
                                  />
                                ) : (
                                  <span>{language === 'vi' ? 'Google chua duoc cau hinh' : 'Google is not configured'}</span>
                                )
                              )}
                            </div>
                          </Button>

                          {pendingGoogleIdToken && pendingGoogleIntent === 'login' && (
                            <div className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
                              <p className="text-sm font-medium text-foreground">
                                {language === 'vi' ? 'Chọn vai trò để hoàn tất đăng nhập Google' : 'Choose role to finish Google sign-in'}
                              </p>
                              <Select value={pendingGoogleRole} onValueChange={(value) => setPendingGoogleRole(value as '1' | '2')}>
                                <SelectTrigger>
                                  <SelectValue placeholder={language === 'vi' ? 'Chọn vai trò' : 'Select role'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                                  <SelectItem value="2">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={() => void onConfirmGoogleLoginRole()} disabled={isGoogleSubmitting}>
                                  {isGoogleSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {language === 'vi' ? 'Xác nhận vai trò' : 'Confirm role'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={resetPendingGoogle}
                                  disabled={isGoogleSubmitting}
                                >
                                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="text-right text-sm">
                            <Link href="/auth/forgot-password" className="text-foreground/70 hover:text-foreground hover:underline">
                              {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                            </Link>
                          </div>
                        </form>
                      </Form>
                    </div>

                    <div className="w-1/2 pl-2">
                      {registerErrorMessage && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{registerErrorMessage}</AlertDescription>
                        </Alert>
                      )}

                      <Form {...registerForm}>
                        <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{language === 'vi' ? 'Họ và tên' : 'Full name'}</FormLabel>
                                <FormControl>
                                  <Input placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                    <FormField
                      control={registerForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'vi' ? 'Số điện thoại' : 'Phone number'}</FormLabel>
                          <FormControl>
                            <Input placeholder="09xxxxxxxx" inputMode="numeric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
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
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'vi' ? 'Vai trò' : 'Role'}</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={language === 'vi' ? 'Chọn vai trò' : 'Select role'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                              <SelectItem value="2">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'vi' ? 'Mật khẩu' : 'Password'}</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" autoComplete="new-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-md border border-border/80 bg-muted/40 p-3">
                      <p className="mb-2 text-xs font-medium text-foreground/80">
                        {language === 'vi' ? 'Yêu cầu mật khẩu' : 'Password requirements'}
                      </p>
                      <div className="space-y-1">
                        <PasswordRule valid={checks.upper} label={language === 'vi' ? 'Có chữ hoa' : 'Has uppercase letter'} />
                        <PasswordRule valid={checks.digit} label={language === 'vi' ? 'Có chữ số' : 'Has digit'} />
                        <PasswordRule valid={checks.special} label={language === 'vi' ? 'Có ký tự đặc biệt' : 'Has special character'} />
                        <PasswordRule valid={checks.length} label={language === 'vi' ? 'Tối thiểu 6 ký tự' : 'At least 6 characters'} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isRegisterSubmitting}>
                      {isRegisterSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {language === 'vi' ? 'Đăng ký' : 'Register'}
                    </Button>

                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/70" />
                      </div>
                      <span className="relative mx-auto block w-fit bg-card px-2 text-xs text-foreground/60">
                        {language === 'vi' ? 'Hoac' : 'Or'}
                      </span>
                    </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={isGoogleSubmitting || isHandlingGoogleCallback}
                          >
                            <div className={cn('flex w-full items-center justify-center', isGoogleSubmitting && 'pointer-events-none opacity-70')}>
                              {isGoogleSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>{language === 'vi' ? 'Dang xu ly Google...' : 'Processing Google...'}</span>
                                </>
                              ) : (
                                hasGoogleClientId ? (
                                  <GoogleLogin
                                    onSuccess={(response) => {
                                      void onGoogleSubmit(response, 'register')
                                    }}
                                    onError={() => {
                                      const message = language === 'vi' ? 'Dang ky Google that bai' : 'Google registration failed'
                                      setRegisterErrorMessage(message)
                                    }}
                                    text="signup_with"
                                    shape="pill"
                                    size="large"
                                    width="320"
                                  />
                                ) : (
                                  <span>{language === 'vi' ? 'Google chua duoc cau hinh' : 'Google is not configured'}</span>
                                )
                              )}
                            </div>
                          </Button>

                          {pendingGoogleIdToken && pendingGoogleIntent === 'register' && (
                            <div className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
                              <p className="text-sm font-medium text-foreground">
                                {language === 'vi' ? 'Chọn vai trò để hoàn tất đăng ký Google' : 'Choose role to finish Google sign-up'}
                              </p>
                              <Select value={pendingGoogleRole} onValueChange={(value) => setPendingGoogleRole(value as '1' | '2')}>
                                <SelectTrigger>
                                  <SelectValue placeholder={language === 'vi' ? 'Chọn vai trò' : 'Select role'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                                  <SelectItem value="2">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={() => void onConfirmGoogleLoginRole()} disabled={isGoogleSubmitting}>
                                  {isGoogleSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {language === 'vi' ? 'Xác nhận vai trò' : 'Confirm role'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetPendingGoogle} disabled={isGoogleSubmitting}>
                                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

