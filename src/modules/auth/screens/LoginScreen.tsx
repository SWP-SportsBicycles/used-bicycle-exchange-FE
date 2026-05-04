'use client'

import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithPopup } from 'firebase/auth'
import { auth, canUseFirebaseAuth, googleProvider } from '@/lib/firebase'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, XCircle } from 'lucide-react'
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
  const [pendingGoogleRole, setPendingGoogleRole] = useState<'2' | '3'>('2')
  const [pendingGooglePhone, setPendingGooglePhone] = useState('')
  const [pendingGooglePhoneError, setPendingGooglePhoneError] = useState<string | null>(null)
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      confirmPassword: '',
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
    // Backend RoleEnum: ADMIN=1, BUYER=2, SELLER=3, INSPECTOR=4
    if (normalized === 1 || normalized === '1' || normalized === 'admin') return 'admin'
    if (normalized === 2 || normalized === '2' || normalized === 'buyer') return 'buyer'
    if (normalized === 3 || normalized === '3' || normalized === 'seller') return 'seller'
    if (normalized === 4 || normalized === '4' || normalized === 'inspector') return 'inspector'
    return null
  }

  const isShippingProfileMissingError = (error: unknown) => {
    if (!(error instanceof Error)) return false
    const message = error.message.toLowerCase()
    return message.includes('not found') || message.includes('404')
  }

  const isMissingGoogleRoleError = (message: string | null) => {
    if (!message) return false
    const normalized = message
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    return (
      normalized.includes('role') &&
      (normalized.includes('required') ||
        normalized.includes('missing') ||
        normalized.includes('must') ||
        normalized.includes('thieu') ||
        normalized.includes('bat buoc') ||
        normalized.includes('vai tro'))
    )
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
    setPendingGooglePhone('')
    setPendingGooglePhoneError(null)
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
        localStorage.setItem('pendingAuthRole', Number(values.role) === 3 ? 'seller' : 'buyer')
      }

      await authApi.signup({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: Number(values.role) as 2 | 3,
      })
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      setRegisterErrorMessage(error instanceof Error ? error.message : 'Đăng ký thất bại')
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const submitGoogleSession = async (
    idToken: string,
    role: AuthRole | undefined,
    target: GoogleIntent,
    options?: { suppressError?: boolean },
  ) => {
    setLoginErrorMessage(null)
    setRegisterErrorMessage(null)
    setIsGoogleSubmitting(true)

    try {
      const session = await authApi.googleLogin(idToken, role)
      await loginWithSession(session)
      const destination = await resolvePostLoginDestination(session, role)
      router.push(destination)
      return { success: true as const, errorMessage: null }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : language === 'vi'
            ? 'Dang nhap Google that bai'
            : 'Google sign-in failed'

      if (!options?.suppressError) {
        if (target === 'login') {
          setLoginErrorMessage(message)
        } else {
          setRegisterErrorMessage(message)
        }
      }
      return { success: false as const, errorMessage: message }
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

  const onGoogleSubmit = async (target: GoogleIntent) => {
    if (target === 'login') {
      setLoginErrorMessage(null)
    } else {
      setRegisterErrorMessage(null)
    }

    if (!canUseFirebaseAuth || !auth || !googleProvider) {
      const message = language === 'vi'
        ? 'Google chưa được cấu hình. Vui lòng kiểm tra biến môi trường Firebase.'
        : 'Google sign-in is not configured. Please check Firebase environment variables.'

      if (target === 'login') {
        setLoginErrorMessage(message)
      } else {
        setRegisterErrorMessage(message)
      }
      return
    }

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      if (target === 'login') {
        const directResult = await submitGoogleSession(idToken, undefined, 'login', { suppressError: true })
        if (directResult.success) {
          return
        }

        if (isMissingGoogleRoleError(directResult.errorMessage)) {
          setPendingGoogleIdToken(idToken)
          setPendingGoogleIntent('login')
          setPendingGoogleRole('2')
          return
        }

        const message = directResult.errorMessage
          ?? (language === 'vi' ? 'Dang nhap Google that bai' : 'Google sign-in failed')
        setLoginErrorMessage(message)
      } else {
        // Register flow: luôn hỏi role + SĐT trước khi gọi API
        setPendingGoogleIdToken(idToken)
        setPendingGoogleIntent('register')
        setPendingGoogleRole(registerRole === '3' ? '3' : '2')
      }
    } catch (err) {
      const message = language === 'vi' ? 'Không thể mở cửa sổ đăng nhập Google' : 'Unable to open Google sign-in'
      if (target === 'login') {
        setLoginErrorMessage(err instanceof Error ? err.message : message)
      } else {
        setRegisterErrorMessage(err instanceof Error ? err.message : message)
      }
    }
  }

  const onConfirmGoogleLoginRole = async () => {
    if (!pendingGoogleIdToken || !pendingGoogleIntent) return

    // Chỉ validate SĐT cho register flow (tài khoản mới cần nhập SĐT)
    // Login flow không cần — tài khoản đã tồn tại đã có SĐT trong hệ thống
    if (pendingGoogleIntent === 'register') {
      const PHONE_REGEX = /^0\d{9}$/
      if (!PHONE_REGEX.test(pendingGooglePhone)) {
        setPendingGooglePhoneError(
          language === 'vi'
            ? 'Số điện thoại phải theo định dạng 0xxxxxxxxx'
            : 'Phone must be in format 0xxxxxxxxx',
        )
        return
      }
      setPendingGooglePhoneError(null)
    }

    const role = pendingGoogleRole === '3' ? 3 : 2
    const { success } = await submitGoogleSession(pendingGoogleIdToken, role, pendingGoogleIntent)

    if (success) {
      // Chỉ update SĐT cho register flow (tài khoản mới)
      // Login flow không gọi updatePhone — không ghi đè SĐT tài khoản cũ
      if (pendingGoogleIntent === 'register') {
        setIsUpdatingPhone(true)
        try {
          await authApi.updatePhone(pendingGooglePhone)
        } catch {
          console.warn('[Auth] Could not update phone number after Google sign-up')
        } finally {
          setIsUpdatingPhone(false)
        }
      }
      resetPendingGoogle()
    }
  }

  return (
    <section className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-10 md:px-10">
      <Link href="/" className="fixed left-4 top-4 z-30 inline-flex items-center gap-2.5 group sm:left-6 sm:top-6 md:left-10 md:top-8 bg-white/90 p-1.5 rounded-lg shadow-sm transition-opacity hover:opacity-80">
        <Image src="/logoSBE.jpg" alt="SBE Logo" width={120} height={40} className="h-8 w-auto object-contain mix-blend-multiply" priority />
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_24px_64px_rgba(0,0,0,0.22)] md:grid-cols-[1.55fr_1fr]">
          <div className="relative min-h-75 md:min-h-170">
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
                                  <div className="relative">
                                    <Input
                                      placeholder="••••••••"
                                      type={showLoginPassword ? 'text' : 'password'}
                                      autoComplete="current-password"
                                      className={cn(!field.value && 'placeholder:text-foreground/30')}
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors select-none"
                                      onMouseDown={() => setShowLoginPassword(true)}
                                      onMouseUp={() => setShowLoginPassword(false)}
                                      onMouseLeave={() => setShowLoginPassword(false)}
                                      onTouchStart={() => setShowLoginPassword(true)}
                                      onTouchEnd={() => setShowLoginPassword(false)}
                                    >
                                      {showLoginPassword
                                        ? <EyeOff className="h-4 w-4" />
                                        : <Eye className="h-4 w-4" />}
                                    </button>
                                  </div>
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
                            onClick={() => void onGoogleSubmit('login')}
                          >
                            <div className={cn('flex w-full items-center justify-center gap-2', isGoogleSubmitting && 'pointer-events-none opacity-70')}>
                              {isGoogleSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>{language === 'vi' ? 'Đang xử lý...' : 'Processing...'}</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                  </svg>
                                  <span>{language === 'vi' ? 'Đăng nhập với Google' : 'Sign in with Google'}</span>
                                </>
                              )}
                            </div>
                          </Button>

                          {pendingGoogleIdToken && pendingGoogleIntent === 'login' && (
                            <div className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
                              <p className="text-sm font-medium text-foreground">
                                {language === 'vi'
                                  ? 'Chọn vai trò để tiếp tục đăng nhập với Google.'
                                  : 'Select your role to continue signing in with Google.'}
                              </p>
                              <Select value={pendingGoogleRole} onValueChange={(value) => setPendingGoogleRole(value as '2' | '3')}>
                                <SelectTrigger>
                                  <SelectValue placeholder={language === 'vi' ? 'Chọn vai trò' : 'Select role'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                                  <SelectItem value="3">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={() => void onConfirmGoogleLoginRole()} disabled={isGoogleSubmitting}>
                                  {isGoogleSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {language === 'vi' ? 'Xác nhận' : 'Confirm'}
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
                              <SelectItem value="2">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                              <SelectItem value="3">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
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
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showRegisterPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                className={cn(!field.value && 'placeholder:text-foreground/30')}
                                {...field}
                              />
                              <button
                                type="button"
                                aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors select-none"
                                onMouseDown={() => setShowRegisterPassword(true)}
                                onMouseUp={() => setShowRegisterPassword(false)}
                                onMouseLeave={() => setShowRegisterPassword(false)}
                                onTouchStart={() => setShowRegisterPassword(true)}
                                onTouchEnd={() => setShowRegisterPassword(false)}
                              >
                                {showRegisterPassword
                                  ? <EyeOff className="h-4 w-4" />
                                  : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm password'}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="••••••••"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                className={cn(!field.value && 'placeholder:text-foreground/30')}
                                {...field}
                              />
                              <button
                                type="button"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors select-none"
                                onMouseDown={() => setShowConfirmPassword(true)}
                                onMouseUp={() => setShowConfirmPassword(false)}
                                onMouseLeave={() => setShowConfirmPassword(false)}
                                onTouchStart={() => setShowConfirmPassword(true)}
                                onTouchEnd={() => setShowConfirmPassword(false)}
                              >
                                {showConfirmPassword
                                  ? <EyeOff className="h-4 w-4" />
                                  : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
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
                            onClick={() => void onGoogleSubmit('register')}
                          >
                            <div className={cn('flex w-full items-center justify-center gap-2', isGoogleSubmitting && 'pointer-events-none opacity-70')}>
                              {isGoogleSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>{language === 'vi' ? 'Đang xử lý...' : 'Processing...'}</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                  </svg>
                                  <span>{language === 'vi' ? 'Đăng ký với Google' : 'Sign up with Google'}</span>
                                </>
                              )}
                            </div>
                          </Button>

                          {pendingGoogleIdToken && pendingGoogleIntent === 'register' && (
                            <div className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
                              <p className="text-sm font-medium text-foreground">
                                {language === 'vi' ? 'Điền thông tin để hoàn tất đăng ký Google' : 'Fill in your details to finish Google sign-up'}
                              </p>
                              <div className="space-y-1">
                                <label className="text-sm font-medium">
                                  {language === 'vi' ? 'Số điện thoại' : 'Phone number'}
                                </label>
                                <Input
                                  placeholder="09xxxxxxxx"
                                  inputMode="numeric"
                                  value={pendingGooglePhone}
                                  onChange={(e) => {
                                    setPendingGooglePhone(e.target.value)
                                    setPendingGooglePhoneError(null)
                                  }}
                                  disabled={isGoogleSubmitting || isUpdatingPhone}
                                />
                                {pendingGooglePhoneError && (
                                  <p className="text-xs text-destructive">{pendingGooglePhoneError}</p>
                                )}
                              </div>
                              <Select value={pendingGoogleRole} onValueChange={(value) => setPendingGoogleRole(value as '2' | '3')}>
                                <SelectTrigger>
                                  <SelectValue placeholder={language === 'vi' ? 'Chọn vai trò' : 'Select role'} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="2">{language === 'vi' ? 'Người mua' : 'Buyer'}</SelectItem>
                                  <SelectItem value="3">{language === 'vi' ? 'Người bán' : 'Seller'}</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={() => void onConfirmGoogleLoginRole()} disabled={isGoogleSubmitting || isUpdatingPhone}>
                                  {(isGoogleSubmitting || isUpdatingPhone) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {language === 'vi' ? 'Xác nhận' : 'Confirm'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={resetPendingGoogle} disabled={isGoogleSubmitting || isUpdatingPhone}>
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

