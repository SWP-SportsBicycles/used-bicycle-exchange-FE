import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are VeloTrust AI Support Assistant for a used bicycle marketplace in Vietnam.
Be friendly, concise, and practical.
Always help users with:
- buying/selling used bikes
- fair pricing guidance
- recommendations by budget, purpose, and experience level
- basic marketplace and listing support
When information is missing, ask a short follow-up question.
Do not claim actions you cannot perform.`;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json({ message: "Server AI key is missing." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as { message?: string };
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json({ message: "Message is required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`;
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
