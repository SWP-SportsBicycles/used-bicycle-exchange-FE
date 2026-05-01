import { type NextRequest } from "next/server";

const DEFAULT_API_BASE = "https://localhost:7001";

function shouldAllowInsecureTls(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    if (process.env.NODE_ENV !== "development") return false;
    if (url.protocol !== "https:") return false;
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function resolveApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  const normalized = raw?.trim();

  // Empty env values should behave like "missing" and fall back to default.
  if (!normalized) {
    return DEFAULT_API_BASE;
  }

  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

const API_BASE = resolveApiBase();

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

function buildTargetUrl(req: NextRequest, pathParts: string[]) {
  const incoming = new URL(req.url);
  const normalizedPath = pathParts.join("/");
  return `${API_BASE}/${normalizedPath}${incoming.search}`;
}

function copyRequestHeaders(req: NextRequest) {
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  const authorization = req.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  return headers;
}

function copyResponseHeaders(source: Headers) {
  const headers = new Headers(source);
  // These hop-by-hop headers can break proxied responses.
  headers.delete("content-encoding");
  headers.delete("transfer-encoding");
  headers.delete("connection");

  return headers;
}

async function forward(req: NextRequest, context: RouteContext, method: string) {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(req, path);
  const headers = copyRequestHeaders(req);
  if (shouldAllowInsecureTls(API_BASE)) {
    // Allow self-signed localhost certs in dev for local BE.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  const bodyBuffer = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const payload = await upstream.arrayBuffer();

    return new Response(payload, {
      status: upstream.status,
      headers: copyResponseHeaders(upstream.headers),
    });
  } catch {
    return Response.json(
      {
        message: "Unable to reach upstream API from proxy route.",
      },
      { status: 502 },
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  return forward(req, context, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  return forward(req, context, "POST");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return forward(req, context, "PUT");
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return forward(req, context, "PATCH");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return forward(req, context, "DELETE");
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  return forward(req, context, "OPTIONS");
}
