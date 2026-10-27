import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const SYSTEM_PROMPT = `You are Aio, the friendly AI assistant for All in One, a home-services marketplace in India (salon at home, massage, cleaning, AC repair, plumbing, electrician, painting, pest control).

Help customers with anything: choosing services, home-care advice, pricing questions, booking help, or general conversation. Be warm, concise and practical. Prices are in INR. When a customer describes a problem, suggest the relevant service category and recommend booking through the site. Never invent exact prices; give typical ranges and point them to the service page for exact pricing. Format answers in markdown.`;

export async function handleChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Sign in to chat" }, 401);

  const supabase = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Sign in to chat" }, 401);

  let body: { messages?: UIMessage[]; threadId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const threadId = String(body.threadId ?? "");
  if (!threadId) return json({ error: "Missing thread" }, 400);

  const { data: thread } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!thread) return json({ error: "Conversation not found" }, 403);

  const modelMessages = await convertToModelMessages(messages);
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendReasoning: true,
    onFinish: async ({ messages: all }) => {
      try {
        const { error: delError } = await supabase
          .from("chat_messages")
          .delete()
          .eq("thread_id", threadId);
        if (delError) {
          console.error("chat_messages delete failed", delError.message);
          return;
        }
        const rows = all
          .filter((m) => m.role !== "system")
          .map((m) => ({
            thread_id: threadId,
            user_id: user.id,
            role: m.role,
            parts: m.parts,
          }));
        if (rows.length) {
          const { error: insError } = await supabase.from("chat_messages").insert(rows);
          if (insError) console.error("chat_messages insert failed", insError.message);
        }
        const firstUser = all.find((m) => m.role === "user");
        const firstText =
          firstUser?.parts?.find((p): p is { type: "text"; text: string } => p.type === "text")
            ?.text ?? "";
        await supabase
          .from("chat_threads")
          .update({
            title: firstText.slice(0, 60) || "New conversation",
            updated_at: new Date().toISOString(),
          })
          .eq("id", threadId);
      } catch (e) {
        console.error("chat persistence failed", e);
      }
    },
  });

  return withLovableAiGatewayRunIdHeader(response, runIdFetch);
}
