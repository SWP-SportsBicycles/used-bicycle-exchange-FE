'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { type Listing, calculateDeposit, formatVND } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface DepositModalProps {
  listing: Listing
  isOpen: boolean
  onClose: () => void
  flowType?: 'soft_reserve' | 'inspection_deposit'
  onSuccess?: (flowType: 'soft_reserve' | 'inspection_deposit') => void
}

type Step = 'review' | 'payment' | 'confirmation'

const paymentMethods = [
  { id: 'bank', label: 'Bank transfer', icon: Building2, description: 'Preferred for managed high-value orders' },
  { id: 'card', label: 'Visa or Mastercard', icon: CreditCard, description: 'Quick card payment for reserve or deposit' },
  { id: 'wallet', label: 'Local wallet', icon: Wallet, description: 'MoMo, ZaloPay, VNPay preview flow' },
]

const cityAddresses: Record<string, string> = {
  hanoi: 'Thanh Xuan, Ha Noi',
  hcm: 'Thu Duc City, Ho Chi Minh City',
  danang: 'Hai Chau, Da Nang',
}

export function DepositModal({
  listing,
  isOpen,
  onClose,
  flowType = 'inspection_deposit',
  onSuccess,
}: DepositModalProps) {
  const [step, setStep] = useState<Step>('review')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const inspectionDepositAmount = calculateDeposit(listing.price)
  const softReserveAmount = Math.min(Math.round(listing.price * 0.02), 500000)
  const isSoftReserve = flowType === 'soft_reserve'
  const depositAmount = isSoftReserve ? softReserveAmount : inspectionDepositAmount
  const tenPercent = listing.price * 0.1
  const isMaxCapped = tenPercent > 2000000

  const stepIndex = step === 'review' ? 0 : step === 'payment' ? 1 : 2

  const handleProceedToPayment = () => {
    if (!agreedToTerms) return
    setStep('payment')
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1600))
    setIsProcessing(false)
    setStep('confirmation')
    onSuccess?.(flowType)
  }

  const handleClose = () => {
    setStep('review')
    setPaymentMethod('bank')
    setAgreedToTerms(false)
    setIsProcessing(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.8rem] border-border/60 bg-[linear-gradient(180deg,rgba(251,252,247,0.98),rgba(244,247,238,0.98))] p-0 shadow-[0_40px_120px_-56px_rgba(30,45,22,0.7)] sm:max-w-3xl">
        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[280px] overflow-hidden md:min-h-[640px]">
            <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.22)_35%,rgba(8,12,6,0.78)_100%)]" />

            <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
              <Badge className="rounded-full border-0 bg-white/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                Managed checkout
              </Badge>
              <Badge variant="outline" className="rounded-full border-white/18 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                {isSoftReserve ? 'Soft reserve' : 'Inspection deposit'}
              </Badge>
            </div>

            <div className="absolute inset-x-5 bottom-5 space-y-4">
              <div className="rounded-[1.45rem] border border-white/12 bg-white/10 p-4 text-white backdrop-blur-md">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/65">Selected bike</div>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.03em]">{listing.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span className="rounded-full border border-white/14 px-2.5 py-1">{listing.brand}</span>
                  <span className="rounded-full border border-white/14 px-2.5 py-1">Size {listing.frameSize}</span>
                  <span className="rounded-full border border-white/14 px-2.5 py-1">{listing.groupset}</span>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-white/12 bg-black/26 p-4 text-white backdrop-blur-md">
                <div className="grid grid-cols-3 gap-3">
                  {['Review', 'Checkout', 'Confirmed'].map((item, index) => (
                    <div key={item} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold',
                            index <= stepIndex
                              ? 'border-[#aee86c] bg-[#aee86c] text-[#1f2c12]'
                              : 'border-white/18 bg-white/10 text-white/65'
                          )}
                        >
                          {index + 1}
                        </div>
                        <span className={cn('text-xs font-medium', index <= stepIndex ? 'text-white' : 'text-white/60')}>{item}</span>
                      </div>
                      <div className={cn('h-1 rounded-full', index <= stepIndex ? 'bg-[#aee86c]' : 'bg-white/12')} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {step === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14 }}
                  className="space-y-6"
                >
                  <DialogHeader className="space-y-3">
                    <div className="eyebrow-chip">Reserve with structure</div>
                    <DialogTitle className="text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">
                      {isSoftReserve ? 'Secure your place in line' : 'Activate the inspection workflow'}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                      {isSoftReserve
                        ? 'Use a small reserve to lock the listing and reveal the seller handoff details.'
                        : 'Place the managed deposit to start inspection scheduling and formal reporting.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="premium-subpanel p-4">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      Deposit summary
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Listing price</span>
                        <span className="font-medium text-foreground">{formatVND(listing.price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{isSoftReserve ? 'Reserve amount' : '10% deposit'}</span>
                        <span className="font-medium text-foreground">
                          {formatVND(isSoftReserve ? listing.price * 0.02 : tenPercent)}
                        </span>
                      </div>
                      {!isSoftReserve && isMaxCapped && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Deposit cap</span>
                          <Badge variant="outline" className="rounded-full border px-2 py-0 text-[10px] font-semibold">Max 2.000.000d</Badge>
                        </div>
                      )}
                      {isSoftReserve && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Reserve cap</span>
                          <Badge variant="outline" className="rounded-full border px-2 py-0 text-[10px] font-semibold">Max 500.000d</Badge>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-semibold text-foreground">Amount due now</span>
                        <span className="text-2xl font-extrabold tracking-[-0.03em] text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                          {formatVND(depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-foreground">What happens next</div>
                    <div className="space-y-2">
                      {(isSoftReserve
                        ? [
                            'The listing is held in a managed reserve queue.',
                            'Seller contact details unlock for direct scheduling.',
                            'You can move forward into the inspection deposit flow next.',
                            'Reserve reduces the chance of losing the bike while deciding.',
                          ]
                        : [
                            'An inspector can now coordinate the inspection window with the seller.',
                            'You receive a structured condition report before the final payment step.',
                            'Critical issues can trigger cancellation or escalation handling.',
                            'The seller contact trail stays attached to the transaction record.',
                          ]).map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/72 px-3.5 py-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="text-sm leading-6 text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-border/60 bg-white/72 p-4">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(event) => setAgreedToTerms(event.target.checked)}
                      className="mt-1 rounded border-border"
                    />
                    <span className="text-sm leading-6 text-muted-foreground">
                      I agree to the checkout terms, reserve policy, and refund handling rules attached to this managed transaction.
                    </span>
                  </label>

                  <Button className="w-full" size="lg" disabled={!agreedToTerms} onClick={handleProceedToPayment}>
                    Continue to payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  className="space-y-6"
                >
                  <DialogHeader className="space-y-3">
                    <div className="eyebrow-chip">Protected payment step</div>
                    <DialogTitle className="text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">
                      Choose a payment method
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-muted-foreground">
                      Complete {formatVND(depositAmount)} to move this order into the managed checkout timeline.
                    </DialogDescription>
                  </DialogHeader>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-4 rounded-[1.35rem] border p-4 transition-all',
                          paymentMethod === method.id
                            ? 'border-primary/25 bg-primary/8'
                            : 'border-border/60 bg-white/72 hover:border-border'
                        )}
                      >
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/70 text-foreground">
                          <method.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground">{method.label}</div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">{method.description}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  <div className="premium-subpanel p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount due now</span>
                      <span className="text-2xl font-extrabold tracking-[-0.03em] text-primary" style={{ fontFamily: 'var(--font-archivo)' }}>
                        {formatVND(depositAmount)}
                      </span>
                    </div>
                  </div>

                  <Alert className="rounded-[1.2rem] border-primary/15 bg-primary/6">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <AlertDescription className="leading-6 text-muted-foreground">
                      Payment preview is presented as a managed transaction step with reserve, inspection, and seller handoff attached to the same order record.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('review')}>
                      Back
                    </Button>
                    <Button className="flex-1" onClick={handleConfirmPayment} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          Confirm payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'confirmation' && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-3"
                >
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-[1.45rem] font-bold tracking-[-0.03em] text-foreground">
                      {isSoftReserve ? 'Reserve confirmed' : 'Inspection deposit confirmed'}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Order reference{' '}
                      <span className="rounded-full border border-border/70 bg-white px-2 py-1 font-mono text-foreground">
                        VT-{Date.now().toString(36).toUpperCase()}
                      </span>
                    </p>
                  </div>

                  <div className="premium-subpanel p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Transaction unlocked
                    </div>
                    <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                      {isSoftReserve ? (
                        <>
                          <p>The listing is now held in your reserve flow.</p>
                          <p>You can move next into inspection scheduling or message the seller with the unlocked details below.</p>
                        </>
                      ) : (
                        <>
                          <p>The transaction is now queued for inspection coordination and structured reporting.</p>
                          <p>Seller contact and order tracking stay connected inside the managed handoff flow.</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-primary/15 bg-primary/6 p-4">
                    <div className="mb-3 text-sm font-semibold text-foreground">Seller handoff details</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Seller</span>: {listing.seller.name}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Phone</span>: {listing.seller.phone ?? '09xx xxx 521'}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Area</span>: {listing.seller.address ?? cityAddresses[listing.city]}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleClose}>
                    View my order center
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
