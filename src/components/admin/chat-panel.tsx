import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api, type AdminUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatPanel({ me }: { me: AdminUser }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  // Simple, reliable live chat: poll the server every 3 seconds.
  const { data, isLoading } = useQuery({
    queryKey: ["chat"],
    queryFn: api.listChat,
    refetchInterval: 3000,
  });
  const messages = data?.messages ?? [];

  const send = useMutation({
    mutationFn: (value: string) => api.sendChat(value),
    onSuccess: async () => {
      setText("");
      await queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Message not sent."),
  });

  // Scroll to the newest message when new ones arrive.
  useEffect(() => {
    if (messages.length !== lastCount.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      lastCount.current = messages.length;
    }
  }, [messages.length]);

  function submit() {
    const value = text.trim();
    if (!value || send.isPending) return;
    send.mutate(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-bold">Team chat</h2>
      <p className="mt-1 text-sm text-muted-foreground">Private to logged-in admins. Updates every few seconds.</p>

      <div className="mt-6 flex h-[28rem] flex-col border bg-card/40">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello 👋</p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === me.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] px-3 py-2", mine ? "bg-primary text-primary-foreground" : "border bg-background")}>
                  <p className={cn("text-xs font-semibold", mine ? "text-primary-foreground/80" : "text-primary")}>
                    {m.senderName}
                    {m.role === "owner" ? " · owner" : ""}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{m.text}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-end gap-2 border-t p-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={1000}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            className="min-h-0 resize-none"
          />
          <Button onClick={submit} disabled={send.isPending || !text.trim()} aria-label="Send message">
            {send.isPending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </section>
  );
}
