"use client";

import { useState, useCallback } from "react";
import { SchemaPanel } from "@/components/SchemaPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { FloatingChat } from "@/components/FloatingChat";
import type { ChatToSqlResponse } from "@/lib/api";

export default function Home() {
  const [question, setQuestion] = useState<string | null>(null);
  const [result, setResult] = useState<ChatToSqlResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResult = useCallback((q: string, data: ChatToSqlResponse) => {
    setQuestion(q);
    setResult(data);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[#fafafa]">
      <header className="flex shrink-0 items-center border-b border-[#e5e5e5] bg-white px-4 py-3">
        <h1 className="text-lg font-medium text-[#1a1a1a]">NL2SQL-Lite</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-hidden border-r border-[#e5e5e5] bg-white">
          <SchemaPanel />
        </aside>

        <main className="flex-1 overflow-hidden bg-[#fafafa] pb-24">
          <ResultsPanel question={question} data={result} loading={loading} />
        </main>
      </div>

      <FloatingChat onResult={handleResult} onLoading={setLoading} />
    </div>
  );
}
