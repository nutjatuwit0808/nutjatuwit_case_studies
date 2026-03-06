"use client";

import { useChatStore } from "@/lib/chat-store";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const { messages, isStreaming } = useChatStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-slate-500">
            สวัสดีครับ ยินดีให้บริการ กรุณาพิมพ์คำถามของคุณ
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start mb-3">
            <div className="rounded-lg bg-slate-700 px-4 py-2">
              <span className="animate-pulse">▌</span>
            </div>
          </div>
        )}
      </div>
      <ChatInput />
    </div>
  );
}
