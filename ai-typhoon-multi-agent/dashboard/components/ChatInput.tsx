"use client";

import { useChatStore } from "@/lib/chat-store";

export function ChatInput() {
  const { input, setInput, sendMessage, isStreaming } = useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-slate-700">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="พิมพ์ข้อความ..."
        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        disabled={isStreaming}
      />
      <button
        type="submit"
        disabled={isStreaming || !input.trim()}
        className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isStreaming ? "กำลังส่ง..." : "ส่ง"}
      </button>
    </form>
  );
}
