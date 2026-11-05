import { SYSTEM_PROMPT } from "@/sections/Hero/zekePrompt";

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"];
const MAX_MESSAGES = 10;
const MAX_TEXT = 2000;
const LIMIT_PER_MINUTE = 8;

const hits = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const hit = hits.get(ip);
  if (!hit || hit.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  return ++hit.count > LIMIT_PER_MINUTE;
}

type Message = { from: "you" | "zeke"; text: string };

function isMessage(m: unknown): m is Message {
  const { from, text } = (m ?? {}) as Partial<Message>;
  return (from === "you" || from === "zeke") && typeof text === "string" && text.length > 0 && text.length <= MAX_TEXT;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limited(ip)) return Response.json({ error: "Too many messages" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const messages: unknown = body?.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isMessage) ||
    messages.at(-1)?.from !== "you"
  ) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: messages
      .slice(messages.findIndex((m) => m.from === "you"))
      .map((m) => ({ role: m.from === "you" ? "user" : "model", parts: [{ text: m.text }] })),
    generationConfig: { maxOutputTokens: 300 },
  });

  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
        body: payload,
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) {
        console.error("Gemini request failed", model, res.status, await res.text());
        continue;
      }
      const data = await res.json();
      const parts: { text?: string }[] = data.candidates?.[0]?.content?.parts ?? [];
      // Models slip em dashes in despite the prompt, so strip them here too.
      const reply = parts.map((p) => p.text ?? "").join("").replace(/\s*—\s*/g, ", ").trim();
      if (reply) return Response.json({ reply });
      console.error("Gemini returned no text", model, data.candidates?.[0]?.finishReason ?? data.promptFeedback);
    } catch (err) {
      console.error("Gemini request failed", model, err);
    }
  }
  return Response.json({ error: "Chat unavailable" }, { status: 502 });
}
