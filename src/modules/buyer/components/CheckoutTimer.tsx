'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutTimerProps {
  expiresAt: string // ISO 8601
  onExpire: () => void
}

export function CheckoutTimer({ expiresAt, onExpire }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(300)

  useEffect(() => {
    const targetDate = new Date(expiresAt).getTime()

    const intervalId = setInterval(() => {
      const now = new Date().getTime()
      const diff = Math.floor((targetDate - now) / 1000)

      if (diff <= 0) {
        clearInterval(intervalId)
        setTimeLeft(0)
        onExpire()
      } else {
        setTimeLeft(diff)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  const isDanger = timeLeft <= 60 // last 1 minute

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg tabular-nums transition-colors",
      isDanger ? "bg-destructive/10 text-destructive animate-pulse" : "bg-primary/10 text-primary"
    )}>
      <Clock className="h-5 w-5" />
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}
