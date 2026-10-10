import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import assistantAvatar from "@/assets/ai-assistant.png";

type Thread = { id: string; title: string; updated_at: string };

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [{ title: "Aio — AI Assistant | All in One" }],
  }),
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatThread key={threadId} threadId={threadId} />;
}

function ChatThread({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: threadRows }, { data: msgRows, error }] = await Promise.all([
        supabase.from("chat_threads").select("id, title, updated_at").order("updated_at", { ascending: false }),
        supabase
          .from("chat_messages")
          .select("id, role, parts, created_at")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      setThreads((threadRows as Thread[]) ?? []);
      if (error) {
        setLoadError("Couldn't load this conversation.");
        setInitialMessages([]);
        return;
      }
      setInitialMessages(
        (msgRows ?? []).map((m) => ({
          id: m.id,
          role: m.role as UIMessage["role"],
          parts: (m.parts as UIMessage["parts"]) ?? [],
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    transport,
    messages: initialMessages ?? [],
    onError: (e) => toast.error(e.message || "Something went wrong"),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  async function newChat() {
    const { data, error: err } = await supabase
      .from("chat_threads")
      .insert({ title: "New conversation" })
      .select("id")
      .single();
    if (err || !data) {
      toast.error("Couldn't start a new conversation");
      return;
    }
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  }

  async function deleteThread(id: string) {
    const { error: err } = await supabase.from("chat_threads").delete().eq("id", id);
    if (err) {
      toast.error("Couldn't delete conversation");
      return;
    }
    setThreads((t) => t.filter((x) => x.id !== id));
    if (id === threadId) {
      const remaining = threads.filter((x) => x.id !== id);
      if (remaining.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id } });
      } else {
        const { data } = await supabase
          .from("chat_threads")
          .insert({ title: "New conversation" })
          .select("id")
          .single();
        if (data) navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
      }
    }
  }

  function onSubmit(message: PromptInputMessage) {
    const text = message.text.trim();
    if (!text || busy) return;
    sendMessage({ text });
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Thread sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col rounded-2xl border border-border bg-card p-3 md:flex">
          <button
            onClick={newChat}
            className="mb-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <MessageSquarePlus className="h-4 w-4" /> New chat
          </button>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
                  t.id === threadId ? "bg-secondary font-medium" : "hover:bg-secondary/60"
                }`}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="min-w-0 flex-1 truncate px-1 py-0.5"
                >
                  {t.title || "New conversation"}
                </Link>
                <button
                  aria-label="Delete conversation"
                  onClick={() => deleteThread(t.id)}
                  className="hidden rounded p-1 text-muted-foreground hover:text-destructive group-hover:block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <section className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <img src={assistantAvatar} alt="Aio" width={32} height={32} className="h-8 w-8 rounded-lg" />
            <div>
              <p className="text-sm font-semibold">Aio</p>
              <p className="text-xs text-muted-foreground">Your All in One assistant</p>
            </div>
            <button
              onClick={newChat}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary md:hidden"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" /> New
            </button>
          </div>

          {initialMessages === null ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              {loadError || "Loading conversation…"}
            </div>
          ) : (
            <Conversation className="flex-1">
              <ConversationContent className="gap-6 px-5 py-6">
                {messages.length === 0 && (
                  <ConversationEmptyState
                    title="Hi, I'm Aio"
                    description="Ask me anything — help picking a service, home-care tips, or how booking works."
                  />
                )}
                {messages.map((m, i) => (
                  <Message key={m.id} from={m.role}>
                    {m.role === "assistant" && (
                      <img
                        src={assistantAvatar}
                        alt=""
                        width={28}
                        height={28}
                        className="mt-1 h-7 w-7 shrink-0 rounded-md"
                      />
                    )}
                    <MessageContent
                      className={
                        m.role === "user"
                          ? "rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground"
                          : "flex-1"
                      }
                    >
                      {m.parts.map((part, pi) =>
                        part.type === "text" ? (
                          m.role === "assistant" ? (
                            <MessageResponse key={pi}>{part.text}</MessageResponse>
                          ) : (
                            <p key={pi} className="whitespace-pre-wrap text-sm">
                              {part.text}
                            </p>
                          )
                        ) : null,
                      )}
                      {m.role === "assistant" &&
                        status === "submitted" &&
                        i === messages.length - 1 && <Shimmer>Thinking…</Shimmer>}
                    </MessageContent>
                  </Message>
                ))}
                {status === "submitted" && messages[messages.length - 1]?.role === "user" && (
                  <Message from="assistant">
                    <img
                      src={assistantAvatar}
                      alt=""
                      width={28}
                      height={28}
                      className="mt-1 h-7 w-7 shrink-0 rounded-md"
                    />
                    <MessageContent className="flex-1">
                      <Shimmer>Thinking…</Shimmer>
                    </MessageContent>
                  </Message>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          )}

          {error && (
            <p className="border-t border-border px-5 py-2 text-xs text-destructive">
              {error.message || "Something went wrong. Please try again."}
            </p>
          )}

          <div className="border-t border-border p-3">
            <PromptInput onSubmit={onSubmit} className="rounded-xl border border-border bg-background">
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Ask Aio anything…"
                disabled={busy}
                className="min-h-[52px]"
              />
              <PromptInputFooter className="justify-end p-2">
                <PromptInputSubmit status={status} onStop={stop} disabled={!busy && false} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
