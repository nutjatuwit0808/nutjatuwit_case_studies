import type { VocAnalytics } from "@/types/voc";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function sendChatMessage(
  message: string,
  sessionId: string,
  onChunk: (content: string) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Failed to send message");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) onChunk(data.content);
        } catch {
          // ignore parse errors
        }
      }
    }
  }
}

export async function fetchVocAnalytics(): Promise<VocAnalytics> {
  const res = await fetch(`${API_URL}/api/voc/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
