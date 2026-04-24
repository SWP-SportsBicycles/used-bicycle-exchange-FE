export async function sendMessage(message: string) {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || "Chat request failed.");
  }

  const payload = (await response.json()) as { content?: string };
  return payload.content ?? "";
}
