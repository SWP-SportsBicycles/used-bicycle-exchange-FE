export async function sendMessage(message: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
