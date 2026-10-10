import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({
    meta: [{ title: "Aio — AI Assistant | All in One" }],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (threads && threads.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
        return;
      }
      const { data: created, error } = await supabase
        .from("chat_threads")
        .insert({ title: "New conversation" })
        .select("id")
        .single();
      if (error || !created) {
        started.current = false;
        return;
      }
      navigate({ to: "/chat/$threadId", params: { threadId: created.id }, replace: true });
    })();
  }, [navigate]);

  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 text-sm text-muted-foreground">
        Opening your conversations…
      </div>
    </SiteLayout>
  );
}
