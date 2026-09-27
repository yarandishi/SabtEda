"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderType: string;
  body: string;
  dateLabel: string;
  mine: boolean;
}

export function ReferrerMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/referrer/messages", { cache: "no-store" });
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) setMessages(data.messages);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 12000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/referrer/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "ارسال ناموفق بود.");
      }
      setMessages((prev) => [...prev, data.message]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <MessageSquare className="h-4 w-4 text-forest" />
        <p className="text-sm font-bold text-navy">پیام به مدیریت</p>
      </div>
      <div className="border-b border-border bg-forest-soft/40 px-4 py-2">
        <p className="text-[11px] leading-5 text-muted-foreground">
          سؤالات خود را اینجا بپرسید. پاسخ مدیریت و اطلاع‌رسانی‌ها (مثل واریز سود) در همین بخش نمایش داده می‌شود. تاریخچه پیام‌ها حفظ می‌شود.
        </p>
      </div>

      <div ref={scrollRef} className="kk-scroll space-y-2 overflow-y-auto p-4" style={{ minHeight: "240px", maxHeight: "360px" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            هنوز پیامی ندارید. اولین پیام خود را ارسال کنید.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-6",
                  m.mine ? "bg-forest text-white" : "bg-mist text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn("mt-1 text-[10px]", m.mine ? "text-white/60" : "text-muted-foreground")}>
                  {m.dateLabel}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="h-11"
        />
        <Button
          type="submit"
          disabled={sending || !text.trim()}
          className="h-11 bg-forest px-4 hover:bg-forest/90"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      {error && (
        <p className="px-3 pb-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
