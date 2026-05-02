import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getRoleApiContext, type ChatRole } from "@/lib/chat/api-knowledge";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;
const DEFAULT_PAGE_SIZE = 50;

const RAW_API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://sportsbicycles-api9-e5bjfdcqcfagcgg6.southeastasia-01.azurewebsites.net/swagger/index.html";

const SENSITIVE_FIELDS = new Set([
  "email",
  "phoneNumber",
  "bankAccountNumber",
  "bankAccountName",
  "senderAddress",
  "refreshToken",
]);

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

function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (trimmed.includes("/swagger/")) {
    return trimmed.split("/swagger/")[0];
  }
  return trimmed;
}

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);

const SYSTEM_PROMPT = `You are SBE virtual assistant.
Primary language: Vietnamese (natural, polite, modern tone). Use English only if the user asks in English.

Brand name usage:
- Use "SBE" as the system name in all responses. Do not use "VeloTrust".

Core behavior:
- Be friendly, intelligent, concise, and practical.
- Answer the user's exact question first, then add only key context.
- If data is available, give concrete numbers/statuses from live data.
- If data is missing, say it clearly and ask one short follow-up question.
- Never invent actions or data.

Style rules:
- Keep most replies to 2-5 short sentences.
- Use simple words, natural conversational flow, and avoid robotic phrasing.
- Prefer plain text. Use short bullet points only when listing options/steps.
- Avoid repeating the same idea.
- No markdown symbols like *, **, or __.

For API/dev questions:
- Mention endpoint + method + required params/body fields briefly.
- Keep explanations compact, readable for FE users.`;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapTokenRole(payload: Record<string, unknown> | null): ChatRole {
  if (!payload) return "guest";
  const roleClaim = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? payload.role ?? payload.Role;
  const roleValue = typeof roleClaim === "string" ? roleClaim.toUpperCase() : "";
  if (roleValue === "ADMIN") return "admin";
  if (roleValue === "SELLER") return "seller";
  if (roleValue === "INSPECTOR") return "inspector";
  if (roleValue === "BUYER") return "buyer";
  return "guest";
}

function getRoleTone(role: ChatRole): string {
  if (role === "admin") {
    return "Tone for ADMIN: professional, operational, decision-focused. Prioritize metrics, risks, and clear next actions.";
  }
  if (role === "seller") {
    return "Tone for SELLER: practical and supportive. Focus on listing quality, order flow, shipment, and payout readiness.";
  }
  if (role === "buyer") {
    return "Tone for BUYER: friendly shopping assistant. Focus on finding bikes, pricing clarity, orders, payment, and support steps.";
  }
  if (role === "inspector") {
    return "Tone for INSPECTOR: concise task-oriented guidance. Focus on pending tasks, inspection submission, and status tracking.";
  }
  return "Tone for GUEST: welcoming and helpful, ask user to sign in when role-protected data is needed.";
}

function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("accessToken="));
  if (!match) return null;
  const token = decodeURIComponent(match.slice("accessToken=".length));
  return token || null;
}

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }
  if (!value || typeof value !== "object") return value;

  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(source)) {
    if (SENSITIVE_FIELDS.has(key)) {
      output[key] = "[REDACTED]";
      continue;
    }
    output[key] = redactSensitive(val);
  }
  return output;
}

function detectIntent(message: string): "orders" | "users" | "listings" | "reports" | "cart" | "general" {
  const q = message.toLowerCase();
  if (/order|đơn|giao dịch|payout|doanh thu|hoàn thành|completed/.test(q)) return "orders";
  if (/user|người dùng|buyer|seller|admin|inspector|tài khoản/.test(q)) return "users";
  if (/listing|tin đăng|xe|duyệt tin|approve|reject/.test(q)) return "listings";
  if (/report|báo cáo|tranh chấp/.test(q)) return "reports";
  if (/cart|giỏ hàng|wishlist/.test(q)) return "cart";
  return "general";
}

async function callBackend(path: string, token: string, search?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      endpoint: path,
      ok: false,
      status: response.status,
      body: await response.text().catch(() => ""),
    };
  }

  const data = await response.json().catch(() => ({}));
  return {
    endpoint: path,
    ok: true,
    status: response.status,
    body: redactSensitive(data),
  };
}

async function fetchLiveDataByRole(role: ChatRole, message: string, token: string | null) {
  if (!token || role === "guest") return [];
  const intent = detectIntent(message);
  const tasks: Array<Promise<unknown>> = [];

  if (role === "admin") {
    if (intent === "orders" || intent === "general") {
      tasks.push(callBackend("/api/AdminOrder", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "users" || intent === "general") {
      tasks.push(callBackend("/api/AdminUser", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
      tasks.push(callBackend("/api/AdminUser/sellers", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
      tasks.push(callBackend("/api/AdminUser/buyers", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "listings" || intent === "general") {
      tasks.push(callBackend("/api/admin-listing/all", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
      tasks.push(callBackend("/api/admin-listing", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "general") {
      tasks.push(callBackend("/api/AdminDashboard", token));
    }
  }

  if (role === "buyer") {
    if (intent === "orders" || intent === "general") {
      tasks.push(callBackend("/api/buyer-order", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "listings" || intent === "general") {
      tasks.push(callBackend("/api/buyer-listing", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "reports" || intent === "general") {
      tasks.push(callBackend("/api/buyer-report/my", token));
    }
    if (intent === "cart" || intent === "general") {
      tasks.push(callBackend("/api/buyer-cart/my-cart", token));
      tasks.push(callBackend("/api/wishlist", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
  }

  if (role === "seller") {
    if (intent === "listings" || intent === "general") {
      tasks.push(callBackend("/api/seller-listing", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "orders" || intent === "general") {
      tasks.push(callBackend("/api/SellerOrder", token, { page: 1, size: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "general") {
      tasks.push(callBackend("/api/SellerShippingProfile", token));
    }
  }

  if (role === "inspector") {
    if (intent === "orders" || intent === "general") {
      tasks.push(callBackend("/api/inspector/pending", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
      tasks.push(callBackend("/api/inspector/history", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
    if (intent === "listings" || intent === "general") {
      tasks.push(callBackend("/api/inspector-listing/pending", token, { pageNumber: 1, pageSize: DEFAULT_PAGE_SIZE }));
    }
  }

  const results = await Promise.all(tasks);
  return results;
}

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

    const token = extractTokenFromRequest(request);
    const payload = decodeJwtPayload(token ?? "");
    const role = mapTokenRole(payload);
    const roleContext = getRoleApiContext(role);
    const roleTone = getRoleTone(role);
    const liveData = await fetchLiveDataByRole(role, userMessage, token);
    const liveDataContext = liveData.length
      ? JSON.stringify(liveData, null, 2).slice(0, 12000)
      : "No live data fetched for this request.";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `${SYSTEM_PROMPT}

Role-aware API policy:
${roleContext}
${roleTone}

When user asks about API:
- Only mention endpoints from allowed list.
- Provide method + path + important params/body keys.
- If endpoint is out of role scope, clearly say no permission and suggest who can access.

Live data mode:
- Prefer using the provided live backend data snapshot to answer.
- If live data is available, include concrete numbers/statuses from it.
- If live data is missing for the question, say which endpoint user should call.

Live backend snapshot (already role-filtered and redacted):
${liveDataContext}

User: ${userMessage}`;

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
