'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Mail, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const LOGIN_IMAGE =
  'https://www.theproscloset.com/cdn/shop/t/866/assets/login-modal-img.webp?v=130212517508398775691771966687'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type View = 'login' | 'register'

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { login } = useAuth()
  const [view, setView] = React.useState<View | 'reset'>('login')

  const [loginEmail, setLoginEmail] = React.useState('')
  const [loginPassword, setLoginPassword] = React.useState('')
  const [loginErrors, setLoginErrors] = React.useState<Record<string, string>>({})

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [regEmail, setRegEmail] = React.useState('')
  const [regPassword, setRegPassword] = React.useState('')
  const [newsletter, setNewsletter] = React.useState(true)
  const [regErrors, setRegErrors] = React.useState<Record<string, string>>({})

  const [resetEmail, setResetEmail] = React.useState('')
  const [resetErrors, setResetErrors] = React.useState<Record<string, string>>({})
  const [resetSent, setResetSent] = React.useState(false)

  const resetModalState = React.useCallback(() => {
    setView('login')
    setLoginErrors({})
    setRegErrors({})
    setResetErrors({})
    setResetSent(false)
  }, [])

  const handleDialogOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        resetModalState()
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetModalState],
  )

  /* Compact inputs — fits form + benefits without scrollbar (desktop) */
  const inputClass =
    'h-9 w-full rounded-full border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 shadow-none outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/15'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!loginEmail.trim()) err.email = 'Email is required'
    else if (!isValidEmail(loginEmail)) err.email = 'Please enter a valid email'
    if (!loginPassword) err.password = 'Password is required'
    else if (loginPassword.length < 6) err.password = 'Password must be at least 6 characters'
    setLoginErrors(err)
    if (Object.keys(err).length > 0) return
    login('buyer')
    onOpenChange(false)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!firstName.trim()) err.firstName = 'First name is required'
    if (!lastName.trim()) err.lastName = 'Last name is required'
    if (!regEmail.trim()) err.email = 'Email is required'
    else if (!isValidEmail(regEmail)) err.email = 'Please enter a valid email'
    if (!regPassword) err.password = 'Password is required'
    else if (regPassword.length < 6) err.password = 'Password must be at least 6 characters'
    setRegErrors(err)
    if (Object.keys(err).length > 0) return
    login('buyer')
    onOpenChange(false)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!resetEmail.trim()) err.email = 'Email is required'
    else if (!isValidEmail(resetEmail)) err.email = 'Please enter a valid email'
    setResetErrors(err)
    if (Object.keys(err).length > 0) return
    // Demo UI only: pretend we sent the email
    setResetSent(true)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleDialogOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-md',
          )}
        />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'fixed left-[50%] top-[50%] z-50 w-[calc(100vw-1rem)] max-w-[900px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-2xl duration-200',
            'max-h-[min(92vh,640px)] md:max-h-[min(88vh,620px)]',
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Sign in or create a VeloTrust account
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Authenticate to list bikes, save favorites, and manage orders.
          </DialogPrimitive.Description>
          <div className="flex max-h-[inherit] flex-col overflow-y-auto md:h-[min(620px,88vh)] md:flex-row md:overflow-hidden">
            {/* Image — mobile top, desktop left (fixed height = modal) */}
            <div className="relative h-40 w-full shrink-0 md:h-full md:min-h-0 md:w-1/2 md:max-w-[50%]">
              <Image
                src={LOGIN_IMAGE}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-black/5" />
            </div>

            {/* Form column — no inner scroll on md; content sized to fit */}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:h-full md:w-1/2">
              <DialogPrimitive.Close
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-6 pb-4 pt-9 md:overflow-hidden md:px-8 md:pb-3 md:pt-10">
                <AnimatePresence mode="wait" initial={false}>
                  {view === 'login' ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <h2
                        className="mb-4 text-left text-2xl font-normal tracking-tight text-neutral-900 md:text-[1.65rem]"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        Sign In
                      </h2>
                      <form onSubmit={handleLogin} className="flex flex-1 flex-col space-y-3">
                        <div>
                          <label className="mb-1 block text-xs text-neutral-600">Email</label>
                          <input
                            type="email"
                            autoComplete="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className={cn(inputClass, loginErrors.email && 'border-red-400 focus:border-red-500')}
                            placeholder="you@example.com"
                          />
                          {loginErrors.email && (
                            <p className="mt-1 text-[11px] leading-tight text-red-600">{loginErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-neutral-600">Password</label>
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className={cn(inputClass, loginErrors.password && 'border-red-400 focus:border-red-500')}
                            placeholder="••••••••"
                          />
                          {loginErrors.password && (
                            <p className="mt-1 text-[11px] leading-tight text-red-600">{loginErrors.password}</p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="mt-1 h-9 w-full rounded-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
                        >
                          Sign In
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setView('reset')
                            setResetErrors({})
                            setResetSent(false)
                            setResetEmail(loginEmail)
                          }}
                          className="text-center text-xs text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                        >
                          Forgot your password?
                        </button>
                        <p className="text-center text-xs text-neutral-600">
                          Don&apos;t have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setView('register')
                              setLoginErrors({})
                            }}
                            className="font-semibold text-neutral-900 underline underline-offset-2"
                          >
                            Create an account
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  ) : view === 'register' ? (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <h2
                        className="mb-3 text-left text-2xl font-normal tracking-tight text-neutral-900 md:text-[1.65rem]"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        Create Account
                      </h2>
                      <form onSubmit={handleRegister} className="flex flex-1 flex-col space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs text-neutral-600">First Name</label>
                            <input
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className={cn(inputClass, regErrors.firstName && 'border-red-400')}
                              placeholder="First name"
                            />
                            {regErrors.firstName && (
                              <p className="mt-0.5 text-[11px] leading-tight text-red-600">{regErrors.firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-neutral-600">Last Name</label>
                            <input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className={cn(inputClass, regErrors.lastName && 'border-red-400')}
                              placeholder="Last name"
                            />
                            {regErrors.lastName && (
                              <p className="mt-0.5 text-[11px] leading-tight text-red-600">{regErrors.lastName}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-neutral-600">Email</label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={cn(inputClass, regErrors.email && 'border-red-400')}
                            placeholder="you@example.com"
                          />
                          {regErrors.email && (
                            <p className="mt-0.5 text-[11px] leading-tight text-red-600">{regErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-neutral-600">Password</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className={cn(inputClass, regErrors.password && 'border-red-400')}
                            placeholder="••••••••"
                          />
                          {regErrors.password && (
                            <p className="mt-0.5 text-[11px] leading-tight text-red-600">{regErrors.password}</p>
                          )}
                        </div>
                        <div className="flex items-start gap-2 pt-0.5">
                          <Checkbox
                            id="newsletter"
                            checked={newsletter}
                            onCheckedChange={(c) => setNewsletter(c === true)}
                            className="mt-0.5 h-3.5 w-3.5 border-red-500 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                          />
                          <Label htmlFor="newsletter" className="text-[11px] font-normal leading-snug text-neutral-600">
                            Yes! Sign me up for exclusive deals and news
                          </Label>
                        </div>
                        <Button
                          type="submit"
                          className="h-9 w-full rounded-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
                        >
                          Create
                        </Button>
                        <p className="text-center text-xs text-neutral-600">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setView('login')
                              setRegErrors({})
                            }}
                            className="font-semibold text-neutral-900 underline underline-offset-2"
                          >
                            Sign In
                          </button>
                        </p>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reset"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <h2
                        className="mb-1.5 text-left text-2xl font-normal tracking-tight text-neutral-900 md:text-[1.65rem]"
                        style={{ fontFamily: 'Georgia, \"Times New Roman\", serif' }}
                      >
                        Reset Password
                      </h2>
                      <p className="mb-4 text-sm text-neutral-500">
                        We will send you an email to reset your password.
                      </p>

                      <form onSubmit={handleResetPassword} className="flex flex-1 flex-col space-y-3">
                        <div>
                          <label className="mb-1 block text-xs text-neutral-600">Email</label>
                          <input
                            type="email"
                            autoComplete="email"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value)
                              if (resetSent) setResetSent(false)
                            }}
                            className={cn(inputClass, resetErrors.email && 'border-red-400 focus:border-red-500')}
                            placeholder="you@example.com"
                          />
                          {resetErrors.email && (
                            <p className="mt-1 text-[11px] leading-tight text-red-600">{resetErrors.email}</p>
                          )}
                          {resetSent && (
                            <p className="mt-1 text-[11px] leading-tight text-emerald-700">
                              If an account exists, we sent a reset link to this email.
                            </p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="mt-1 h-9 w-full rounded-full bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
                        >
                          Reset Password
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            setView('login')
                            setResetErrors({})
                            setResetSent(false)
                          }}
                          className="text-center text-xs text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                        >
                          Cancel
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Benefits — compact, sage panel like TPC */}
              <div className="shrink-0 border-t border-neutral-200/80 bg-[#d4d8cf] px-6 py-4 md:px-8">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-800">
                  Benefits
                </p>
                <ul className="space-y-2 text-[11px] leading-snug text-neutral-700">
                  <li className="flex gap-2">
                    <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" strokeWidth={1.5} />
                    <span>Favorite your products & save them to your account</span>
                  </li>
                  <li className="flex gap-2">
                    <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" strokeWidth={1.5} />
                    <span>Save a search & get notified when new products drop</span>
                  </li>
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" strokeWidth={1.5} />
                    <span>Be first to know about the latest events & promotions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
