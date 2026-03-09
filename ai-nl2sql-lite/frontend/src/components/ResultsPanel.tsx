"use client";

import type { ChatToSqlResponse } from "@/lib/api";
import { LoadingMessage } from "@/components/ui/LoadingMessage";
import { PromptBlock } from "@/components/ui/PromptBlock";

type Props = {
  question: string | null;
  data: ChatToSqlResponse | null;
  loading: boolean;
};

export function ResultsPanel({ question, data, loading }: Props) {
  if (loading) {
    return <LoadingMessage message="กำลังประมวลผล..." className="p-6" />;
  }

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-[#666]">
        <p className="text-sm">พิมพ์คำถามด้านล่างเพื่อแปลงเป็น SQL</p>
        <p className="text-xs">เช่น &quot;รวมยอดขายทั้งหมด&quot; หรือ &quot;สินค้าประเภท Electronics มีอะไรบ้าง&quot;</p>
      </div>
    );
  }

  const hasError = !!data.error;
  const rows = data.result ?? [];
  const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {question && (
        <div>
          <h3 className="mb-1 text-xs font-medium text-[#888]">คำถาม</h3>
          <p className="rounded border border-[#e5e5e5] bg-white p-3 text-sm text-[#1a1a1a]">
            {question}
          </p>
        </div>
      )}
      <div>
        <h3 className="mb-1 text-xs font-medium text-[#888]">SQL</h3>
        <pre className="overflow-x-auto rounded border border-[#e5e5e5] bg-[#f9f9f9] p-3 text-sm font-mono text-[#1a1a1a]">
          {data.sql}
        </pre>
      </div>
      {hasError ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {data.error}
        </div>
      ) : (
        <div>
          <h3 className="mb-1 text-xs font-medium text-[#888]">ผลลัพธ์</h3>
          <div className="overflow-x-auto rounded border border-[#e5e5e5]">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#f5f5f5]">
                  {cols.map((c) => (
                    <th key={c} className="px-3 py-2 text-left font-medium text-[#1a1a1a]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#eee] hover:bg-[#fafafa]">
                    {cols.map((c) => (
                      <td key={c} className="px-3 py-2 text-[#333]">
                        {String(row[c] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(data.system_prompt || data.user_prompt) && (
        <div className="mt-2 rounded-lg border-2 border-[#d4d4d4] bg-[#f0f0f0] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#555]">Prompts ที่ใช้</h3>
          <div className="flex flex-col gap-3">
            {data.system_prompt && (
              <PromptBlock label="System Prompt" content={data.system_prompt} />
            )}
            {data.user_prompt && (
              <PromptBlock label="User Prompt" content={data.user_prompt} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
