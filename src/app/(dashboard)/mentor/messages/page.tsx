"use client";

import { useEffect, useState } from "react";
import { Send, MessageSquareText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getMessagesForUser, sendMessage } from "@/lib/data/repository";
import { timeAgo } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

const internNames: Record<string, string> = {
  u_student: "Ananya Gupta",
  u_student2: "Karthik Rao",
  demo_a9: "Nikhil Verma",
  demo_a8: "Sanjana Pillai",
};

export default function MentorMessagesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [activePeer, setActivePeer] = useState("u_student");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const messages = getMessagesForUser(user.id);
  const peers = Object.keys(internNames).filter((id) =>
    messages.some((m) => m.fromId === id || m.toId === id),
  );
  const threadPeers = peers.length > 0 ? peers : Object.keys(internNames).slice(0, 3);
  const thread = messages.filter((m) => m.fromId === activePeer || m.toId === activePeer);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage({ fromId: user.id, toId: activePeer, body: draft.trim() });
    setDraft("");
    toast("success", "Message sent", `Delivered to ${internNames[activePeer]}.`);
  };

  return (
    <DashboardShell>
      <PageHeader title="Messages" description="Direct conversations with your interns." />

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquareText className="h-6 w-6" />}
          title="No conversations yet"
          description="When interns message you, threads appear here."
        />
      ) : (
        <Card className="mx-auto flex h-[62vh] max-w-4xl overflow-hidden">
          <div className="hidden w-60 shrink-0 border-r border-border sm:block">
            <div className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interns</div>
            <div className="space-y-1 p-2">
              {threadPeers.map((id) => (
                <button
                  key={id}
                  onClick={() => setActivePeer(id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activePeer === id ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
                >
                  <Avatar name={internNames[id] ?? id} className="h-7 w-7 text-[10px]" />
                  <span className="truncate">{internNames[id] ?? id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Avatar name={internNames[activePeer] ?? activePeer} />
              <div>
                <p className="text-sm font-semibold">{internNames[activePeer] ?? activePeer}</p>
                <p className="text-xs text-muted-foreground">Intern</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
              {thread.map((m) => {
                const mine = m.fromId === user.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input placeholder={`Message ${internNames[activePeer] ?? "intern"}…`} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <button onClick={handleSend} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}
