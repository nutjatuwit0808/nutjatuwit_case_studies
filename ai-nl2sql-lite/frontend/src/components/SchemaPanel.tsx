"use client";

import { useState } from "react";
import { LoadingMessage } from "@/components/ui/LoadingMessage";
import { useSchema } from "@/hooks/useSchema";

export function SchemaPanel() {
  const { tables, loading, error } = useSchema();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (loading) {
    return <LoadingMessage />;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="p-4 text-sm text-[#666]">
        ไม่มีตารางใน schema
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-3">
      <h2 className="mb-2 text-sm font-medium text-[#1a1a1a]">ตารางใน Schema</h2>
      {tables.map((t) => (
        <div key={t.table_name} className="rounded border border-[#e5e5e5] bg-white">
          <button
            type="button"
            onClick={() => toggle(t.table_name)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-[#1a1a1a] hover:bg-[#f5f5f5]"
          >
            {t.table_name}
            <span className="text-[#888]">{expanded.has(t.table_name) ? "−" : "+"}</span>
          </button>
          {expanded.has(t.table_name) && (
            <div className="border-t border-[#e5e5e5] px-3 py-2">
              {t.columns.map((c) => (
                <div key={c.name} className="flex justify-between gap-4 text-xs text-[#555]">
                  <span>{c.name}</span>
                  <span className="font-mono">{c.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
