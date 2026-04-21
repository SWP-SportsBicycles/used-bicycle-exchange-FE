import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;

function isTransientAiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /\b(500|502|503|504)\b|high demand|temporar|unavailable|overload/i.test(message);
}

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /\b429\b|quota|rate limit|resource exhausted|too many requests/i.test(message);
}

function isAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /\b401\b|\b403\b|api key|permission denied|unauthorized|forbidden/i.test(message);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SYSTEM_PROMPT = `You are VeloTrust AI Support Assistant for a used bicycle marketplace in Vietnam.
Be friendly, concise, and practical.
Always help users with:
- buying/selling used bikes
- fair pricing guidance
- recommendations by budget, purpose, and experience level
- basic marketplace and listing support
When information is missing, ask a short follow-up question.
Do not claim actions you cannot perform.

Response style rules:
- Keep replies short and to the point.
- Prefer 2-4 short sentences, or up to 4 bullet points when listing options.
- Answer the user's main question first, then add only essential details.
- Avoid rambling, repeated ideas, and long explanations unless user asks for detail.
- Do not use markdown symbols such as *, **, or __ in the final answer.
- Return plain text only.`;

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
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`;

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await model.generateContent(prompt);
        const content = result.response.text().replace(/\*/g, "").trim();
        return NextResponse.json({ content });
      } catch (error) {
        lastError = error;

        if (!isTransientAiError(error) || attempt === MAX_RETRIES) {
          break;
        }

        await delay(350 * attempt);
      }
    }

    if (isQuotaError(lastError)) {
      return NextResponse.json(
        { message: "AI quota/rate limit reached. Please try later or check billing quota." },
        { status: 429 },
      );
    }

    if (isAuthError(lastError)) {
      return NextResponse.json(
        { message: "AI authentication failed. Please verify API key permissions." },
        { status: 401 },
      );
    }

    if (isTransientAiError(lastError)) {
      return NextResponse.json(
        { message: "AI is busy right now. Please try again in a few seconds." },
        { status: 503 },
      );
    }

    throw lastError;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
