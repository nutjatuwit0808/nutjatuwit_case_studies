"use client";

type Props = {
  label: string;
  content: string;
};

/** แสดง prompt block (System/User) ใน ResultsPanel */
export function PromptBlock({ label, content }: Props) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium text-[#666]">{label}</h4>
      <pre className="max-h-40 overflow-auto rounded border border-[#d4d4d4] bg-white p-3 text-xs font-mono text-[#1a1a1a] whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}
