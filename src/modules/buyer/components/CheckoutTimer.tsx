'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutTimerProps {
  expiresAt: string
  onExpire: () => void
}

const LOCK_DURATION_SECONDS = 300

function getRemainingSeconds(expiresAt: string) {
  const targetDate = new Date(expiresAt).getTime()

  if (Number.isNaN(targetDate)) {
    return 0
  }

  return Math.max(0, Math.floor((targetDate - Date.now()) / 1000))
}

export function CheckoutTimer({ expiresAt, onExpire }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => getRemainingSeconds(expiresAt))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    hasExpiredRef.current = false

    const syncTimeLeft = () => {
      const nextValue = getRemainingSeconds(expiresAt)
      setTimeLeft(nextValue)

      if (nextValue === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true
        onExpire()
      }
    }

    syncTimeLeft()
    const intervalId = setInterval(syncTimeLeft, 1000)

    return () => clearInterval(intervalId)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isDanger = timeLeft <= 60
  const progressWidth = `${Math.min(100, Math.max(0, (timeLeft / LOCK_DURATION_SECONDS) * 100))}%`

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-xl border bg-muted/50 p-4 transition-colors',
        isDanger ? 'border-destructive bg-destructive/10' : 'border-border/50',
      )}
    >
      <motion.div
        className={cn('absolute left-0 top-0 h-full opacity-20', isDanger ? 'bg-destructive' : 'bg-primary')}
        initial={{ width: progressWidth }}
        animate={{ width: progressWidth }}
        transition={{ ease: 'linear', duration: 1 }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn('h-5 w-5', isDanger ? 'animate-pulse text-destructive' : 'text-primary')} />
          <span className="text-sm font-medium">Cart Lock: Giữ xe trong 5 phút</span>
        </div>
        <div
          className={cn(
            'text-xl font-bold tracking-wider tabular-nums',
            isDanger ? 'text-destructive' : 'text-primary',
          )}
          style={{ fontFamily: 'var(--font-archivo)' }}
        >
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
