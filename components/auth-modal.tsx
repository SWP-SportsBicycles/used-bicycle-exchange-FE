'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, Mail, Search, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const LOGIN_IMAGE =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80'

type View = 'login' | 'register' | 'reset'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

const proofItems = [
  {
    title: 'Save and shortlist',
    description: 'Keep premium listings, inspection-ready bikes, and timing-sensitive finds in one place.',
    icon: Heart,
  },
  {
    title: 'Track managed orders',
    description: 'Follow reserve, inspection, fulfillment, and delivery from a single account center.',
    icon: Search,
  },
  {
    title: 'Stay in the trust loop',
    description: 'Receive updates when reports, approvals, or next transaction steps become available.',
    icon: Mail,
  },
]

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { login } = useAuth()
  const [view, setView] = React.useState<View>('login')

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

  React.useEffect(() => {
    if (!open) return
    setView('login')
    setLoginErrors({})
    setRegErrors({})
    setResetErrors({})
    setResetSent(false)
  }, [open])

  const inputClass =
    'h-11 w-full rounded-2xl border border-border/70 bg-white/85 px-4 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-primary/30 focus:ring-2 focus:ring-primary/10'

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}

    if (!loginEmail.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(loginEmail)) errors.email = 'Enter a valid email'

    if (!loginPassword) errors.password = 'Password is required'
    else if (loginPassword.length < 6) errors.password = 'Password must be at least 6 characters'

    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) return

    login('buyer')
    onOpenChange(false)
  }

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}

    if (!firstName.trim()) errors.firstName = 'First name is required'
    if (!lastName.trim()) errors.lastName = 'Last name is required'
    if (!regEmail.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(regEmail)) errors.email = 'Enter a valid email'
    if (!regPassword) errors.password = 'Password is required'
    else if (regPassword.length < 6) errors.password = 'Password must be at least 6 characters'

    setRegErrors(errors)
    if (Object.keys(errors).length > 0) return

    login('buyer')
    onOpenChange(false)
  }

  const handleResetPassword = (event: React.FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}

    if (!resetEmail.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(resetEmail)) errors.email = 'Enter a valid email'

    setResetErrors(errors)
    if (Object.keys(errors).length > 0) return

    setResetSent(true)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(251,252,247,0.98),rgba(244,247,238,0.98))] shadow-[0_44px_120px_-54px_rgba(18,28,12,0.85)] duration-200',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
          )}
        >
          <DialogPrimitive.Title className="sr-only">VeloTrust account access</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Sign in or create an account to manage reserves, inspections, and order flow.
          </DialogPrimitive.Description>

          <div className="grid min-h-[680px] md:grid-cols-[1.02fr_0.98fr]">
            <div className="relative hidden overflow-hidden md:block">
              <Image src={LOGIN_IMAGE} alt="" fill className="object-cover" sizes="50vw" priority />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.22)_35%,rgba(8,12,6,0.8)_100%)]" />

              <div className="absolute inset-x-7 top-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Managed marketplace access
                </div>
              </div>

              <div className="absolute inset-x-7 bottom-7 space-y-4 text-white">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Premium bike trading</div>
                  <h2 className="mt-3 max-w-md text-[2.3rem] font-bold leading-[1.02] tracking-[-0.05em]">
                    Sign in to keep the full transaction story in one place.
                  </h2>
                </div>

                <div className="grid gap-3">
                  {proofItems.map((item) => (
                    <div key={item.title} className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{item.title}</div>
                          <div className="mt-1 text-xs leading-5 text-white/75">{item.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex min-h-full flex-col">
              <DialogPrimitive.Close
                className="absolute right-4 top-4 z-10 rounded-full border border-border/60 bg-white/80 p-2 text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>

              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 md:hidden">
                <div>
                  <div className="text-sm font-semibold text-foreground">VeloTrust</div>
                  <div className="text-xs text-muted-foreground">Managed marketplace access</div>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-5 py-6 sm:px-7 md:px-8 md:py-8">
                <div className="mb-6">
                  <div className="eyebrow-chip">Access account</div>
                  <h2 className="mt-3 text-[1.85rem] font-bold tracking-[-0.04em] text-foreground">
                    {view === 'login' && 'Welcome back'}
                    {view === 'register' && 'Create your account'}
                    {view === 'reset' && 'Reset password'}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {view === 'login' && 'Save listings, manage orders, and keep every buyer-side step tied to one profile.'}
                    {view === 'register' && 'Create a lightweight account to start saving bikes and following the managed handoff flow.'}
                    {view === 'reset' && 'We will prepare a reset link for the email address attached to your account.'}
                  </p>
                </div>

                <div className="mb-6 inline-flex rounded-full border border-border/70 bg-white/80 p-1">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      view === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      view === 'register' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Create account
                  </button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {view === 'login' && (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLogin}
                      className="flex flex-1 flex-col gap-4"
                    >
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email</label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          className={cn(inputClass, loginErrors.email && 'border-rose-400 focus:ring-rose-100')}
                          placeholder="you@example.com"
                        />
                        {loginErrors.email && <p className="mt-2 text-xs text-rose-600">{loginErrors.email}</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Password</label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className={cn(inputClass, loginErrors.password && 'border-rose-400 focus:ring-rose-100')}
                          placeholder="••••••••"
                        />
                        {loginErrors.password && <p className="mt-2 text-xs text-rose-600">{loginErrors.password}</p>}
                      </div>

                      <Button type="submit" className="mt-2">
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setView('reset')
                          setResetEmail(loginEmail)
                          setResetErrors({})
                          setResetSent(false)
                        }}
                        className="text-left text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
                      >
                        Forgot your password?
                      </button>
                    </motion.form>
                  )}

                  {view === 'register' && (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegister}
                      className="flex flex-1 flex-col gap-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">First name</label>
                          <input
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            className={cn(inputClass, regErrors.firstName && 'border-rose-400 focus:ring-rose-100')}
                            placeholder="First name"
                          />
                          {regErrors.firstName && <p className="mt-2 text-xs text-rose-600">{regErrors.firstName}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Last name</label>
                          <input
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            className={cn(inputClass, regErrors.lastName && 'border-rose-400 focus:ring-rose-100')}
                            placeholder="Last name"
                          />
                          {regErrors.lastName && <p className="mt-2 text-xs text-rose-600">{regErrors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(event) => setRegEmail(event.target.value)}
                          className={cn(inputClass, regErrors.email && 'border-rose-400 focus:ring-rose-100')}
                          placeholder="you@example.com"
                        />
                        {regErrors.email && <p className="mt-2 text-xs text-rose-600">{regErrors.email}</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Password</label>
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(event) => setRegPassword(event.target.value)}
                          className={cn(inputClass, regErrors.password && 'border-rose-400 focus:ring-rose-100')}
                          placeholder="Create a password"
                        />
                        {regErrors.password && <p className="mt-2 text-xs text-rose-600">{regErrors.password}</p>}
                      </div>

                      <div className="rounded-[1.25rem] border border-border/60 bg-white/72 p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="newsletter"
                            checked={newsletter}
                            onCheckedChange={(checked) => setNewsletter(checked === true)}
                            className="mt-0.5"
                          />
                          <Label htmlFor="newsletter" className="text-sm font-normal leading-6 text-muted-foreground">
                            Keep me updated on featured listings, new arrivals, and platform highlights.
                          </Label>
                        </div>
                      </div>

                      <Button type="submit">
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.form>
                  )}

                  {view === 'reset' && (
                    <motion.form
                      key="reset"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleResetPassword}
                      className="flex flex-1 flex-col gap-4"
                    >
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Email</label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={resetEmail}
                          onChange={(event) => {
                            setResetEmail(event.target.value)
                            if (resetSent) setResetSent(false)
                          }}
                          className={cn(inputClass, resetErrors.email && 'border-rose-400 focus:ring-rose-100')}
                          placeholder="you@example.com"
                        />
                        {resetErrors.email && <p className="mt-2 text-xs text-rose-600">{resetErrors.email}</p>}
                        {resetSent && (
                          <p className="mt-2 text-xs text-emerald-700">
                            If an account exists for this address, a reset link has been prepared.
                          </p>
                        )}
                      </div>

                      <Button type="submit">
                        Send reset link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setView('login')
                          setResetErrors({})
                          setResetSent(false)
                        }}
                        className="text-left text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
                      >
                        Back to sign in
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-white/72 p-4 md:hidden">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you unlock</div>
                  <div className="space-y-3">
                    {proofItems.map((item) => (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{item.title}</div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
