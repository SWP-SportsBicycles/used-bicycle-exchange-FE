import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  // Keep runtime warning for local setup mistakes.
  // This file is client-consumed in this project.
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_GEMINI_API_KEY is missing. AI chat will not work.')
}

const genAI = new GoogleGenerativeAI(apiKey ?? '')

export const model = genAI.getGenerativeModel({
  model: 'gemini-3-flash-preview',
})

const SYSTEM_PROMPT = `You are VeloTrust AI Support Assistant for a used bicycle marketplace in Vietnam.
Be friendly, concise, and practical.
Always help users with:
- buying/selling used bikes
- fair pricing guidance
- recommendations by budget, purpose, and experience level
- basic marketplace and listing support
When information is missing, ask a short follow-up question.
Do not claim actions you cannot perform.`

export async function sendMessage(message: string) {
  const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}`
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
