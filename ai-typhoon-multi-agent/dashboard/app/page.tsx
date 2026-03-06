"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { VoCCharts } from "@/components/VoCCharts";
import { useChatStore } from "@/lib/chat-store";

type Tab = "chat" | "voc";

function tabClass(active: boolean) {
  return `rounded px-3 py-1.5 text-sm ${active ? "bg-sky-600" : "bg-slate-700 hover:bg-slate-600"}`;
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const clearMessages = useChatStore((s) => s.clearMessages);

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
        <h1 className="text-xl font-bold">Omni-Typhoon Customer Support</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setTab("chat")} className={tabClass(tab === "chat")}>
            แชท
          </button>
          <button onClick={() => setTab("voc")} className={tabClass(tab === "voc")}>
            VoC Dashboard
          </button>
          {tab === "chat" && (
            <button
              onClick={clearMessages}
              className="rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
            >
              ล้างแชท
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {tab === "chat" && (
          <div className="h-full max-w-3xl mx-auto border-x border-slate-700">
            <ChatPanel />
          </div>
        )}
        {tab === "voc" && (
          <div className="h-full overflow-y-auto p-6">
            <VoCCharts />
          </div>
        )}
      </main>
    </div>
  );
}
