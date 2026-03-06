"use client";

import type { Message } from "@/lib/chat-store";

export function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-sky-600 text-white"
            : "bg-slate-700 text-slate-100 border border-slate-600"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
      </div>
    </div>
  );
}
