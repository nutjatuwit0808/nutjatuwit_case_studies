"use client";

import { useState, useCallback } from "react";
import { chatToSql, type ChatToSqlResponse } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

const SUGGEST_QUESTIONS = [
  "สินค้าประเภท Electronics มีอะไรบ้าง",
  "รวมยอดขายทั้งหมด",
  "ราคาเฉลี่ยของสินค้าเท่าไหร่",
  "ยอดขายสูงสุดคือเท่าไหร่",
  "ยอดขายแยกตามประเภทสินค้า",
];

type Props = {
  onResult: (question: string, data: ChatToSqlResponse) => void;
  onLoading?: (loading: boolean) => void;
};

export function FloatingChat({ onResult, onLoading }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    setLoading(true);
    onLoading?.(true);
    try {
      const data = await chatToSql(q);
      onResult(q, data);
      setInput("");
    } catch (e) {
      onResult(q, {
        sql: "",
        result: [],
        error: getErrorMessage(e),
      });
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [input, loading, onResult, onLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const pickQuestion = useCallback((q: string) => {
    setInput(q);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-10 w-full max-w-2xl -translate-x-1/2 px-4">
      <div className="mb-2 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {SUGGEST_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => pickQuestion(q)}
              disabled={loading}
              className="shrink-0 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs text-[#1a1a1a] hover:bg-[#f5f5f5] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 rounded-lg border border-[#e5e5e5] bg-white p-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ถามเกี่ยวกับข้อมูล เช่น รวมยอดขายทั้งหมด"
          className="flex-1 rounded border border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#999] focus:border-[#999] focus:outline-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading || !input.trim()}
          className="rounded border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : "ส่ง"}
        </button>
      </div>
    </div>
  );
}
