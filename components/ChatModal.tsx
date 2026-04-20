'use client'

import { useEffect, useRef } from 'react'
import { Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type ChatModalProps = {
  open: boolean
  messages: ChatMessage[]
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

export function ChatModal({
  open,
  messages,
  input,
  loading,
  onInputChange,
  onSend,
  onClose,
}: ChatModalProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, open])

  if (!open) return null

  return (
    <div className="fixed bottom-24 right-6 z-9999 w-[320px] rounded-xl border border-border/70 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-xl border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
        <h3 className="text-sm font-semibold">AI Support Assistant</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 transition hover:bg-white/20"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[400px] overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm bg-slate-200 text-slate-900'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-slate-200 px-3 py-2 text-sm text-slate-900">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Typing...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/60 bg-background p-2.5">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onSend()
                  }
                }}
                placeholder="Ask about bikes, pricing..."
                className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none transition focus:border-primary/60"
              />
              <Button
                type="button"
                size="icon"
                onClick={onSend}
                disabled={!input.trim() || loading}
                className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
