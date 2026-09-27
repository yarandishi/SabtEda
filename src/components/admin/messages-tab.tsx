"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Send, ArrowRight, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminFetch } from "./admin-fetch";
import { cn } from "@/lib/utils";

interface MessagesTabProps {
  onSessionExpired: () => void;
  initialReferrerCode?: string | null;
}

interface Conversation {
  referrerCode: string;
  referrerName: string | null;
  lastMessage: string;
  lastSenderType: string;
  lastDateLabel: string;
  lastAt: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderType: string;
  body: string;
  dateLabel: string;
  mine: boolean;
}

export function MessagesTab({ onSessionExpired, initialReferrerCode }: MessagesTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeCode, setActiveCode] = useState<string | null>(initialReferrerCode ?? null);
  const [loadingList, setLoadingList] = useState(true);

  // If a referrer code is passed in (e.g. from the referrers tab), open it.
  useEffect(() => {
    if (initialReferrerCode) {
      setActiveCode(initialReferrerCode);
    }
  }, [initialReferrerCode]);

  const loadList = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/messages", onSessionExpired);
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) setConversations(data.conversations);
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    loadList();
    const id = setInterval(loadList, 15000);
    return () => clearInterval(id);
  }, [loadList]);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-bold text-navy">مکالمات</p>
        </div>
        <div className="kk-scroll max-h-[60vh] overflow-y-auto">
          {loadingList ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              هنوز پیامی دریافت نشده است.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.referrerCode}
                type="button"
                onClick={() => setActiveCode(c.referrerCode)}
                className={cn(
                  "flex w-full items-start gap-2 border-b border-border px-3 py-3 text-right transition-colors",
                  activeCode === c.referrerCode ? "bg-navy-soft" : "hover:bg-mist/60"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy">
                      {c.referrerName ?? c.referrerCode}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="kk-num inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-cta px-1 text-[10px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="kk-num text-[10px] text-muted-foreground">{c.referrerCode}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {c.lastSenderType === "admin" ? "شما: " : ""}
                    {c.lastMessage}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">{c.lastDateLabel}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Active conversation */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {activeCode ? (
          <ConversationThread
            referrerCode={activeCode}
            onSessionExpired={onSessionExpired}
            onBackToList={() => {
              setActiveCode(null);
              loadList();
            }}
          />
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              یک مکالمه را انتخاب کنید تا پیام‌ها را ببینید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationThread({
  referrerCode,
  onSessionExpired,
  onBackToList,
}: {
  referrerCode: string;
  onSessionExpired: () => void;
  onBackToList: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [referrer, setReferrer] = useState<{ code: string; displayName: string | null; contact: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/admin/messages/${referrerCode}`, onSessionExpired);
      if (res.status === 401) return;
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setMessages(data.messages);
        setReferrer(data.referrer);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [referrerCode, onSessionExpired]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 10000);
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
    try {
      const res = await adminFetch(`/api/admin/messages/${referrerCode}`, onSessionExpired, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setMessages((prev) => [...prev, data.message]);
        setText("");
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-navy md:hidden"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-bold text-navy">
              {referrer?.displayName ?? referrerCode}
            </p>
            <p className="kk-num text-[10px] text-muted-foreground">
              {referrerCode}
              {referrer?.contact ? ` · ${referrer.contact}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="kk-scroll flex-1 space-y-2 overflow-y-auto p-4" style={{ minHeight: "300px", maxHeight: "55vh" }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            هنوز پیامی در این مکالمه نیست. اولین پیام را ارسال کنید.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.mine ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-6",
                  m.mine
                    ? "bg-navy text-white"
                    : "bg-mist text-foreground"
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
          placeholder="پاسخ به معرف..."
          className="h-11"
        />
        <Button
          type="submit"
          disabled={sending || !text.trim()}
          className="h-11 bg-navy px-4 hover:bg-navy-dark"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
