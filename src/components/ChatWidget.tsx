'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ChatModal, type ChatMessage } from '@/components/ChatModal'
import { sendMessage } from '@/lib/gemini'

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: 'assistant',
      content:
        'Xin chào! Mình là trợ lý ảo của hệ thống VeloTrust, tui có thể giúp gì cho bạn?',
    },
  ])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMessage: ChatMessage = { id: makeId(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendMessage(text)
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          content: reply || 'I could not generate a response. Please try again.',
        },
      ])
    } catch (error) {
      const fallbackMessage =
        'Sorry, AI is currently busy. Please try again in a few seconds.'
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : fallbackMessage

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          content: message,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ChatModal
        open={open}
        messages={messages}
        input={input}
        loading={loading}
        onInputChange={setInput}
        onSend={handleSend}
        onClose={() => setOpen(false)}
      />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-9999 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
        aria-label="Open AI chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  )
}
