"use client";

import { EmptyState } from "./EmptyState";
import { renderMarkdownBold } from "@/lib/markdown";
import type { VenueSearchResult } from "@/types/venue";

const SearchIcon = () => (
  <svg
    className="w-6 h-6 text-sky-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const EmptyResultIcon = () => (
  <svg
    className="w-6 h-6 text-amber-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

interface RAGResponseProps {
  ragResponse: string | null;
  venues: VenueSearchResult[];
  hasSearched?: boolean;
  onVenueClick?: (venue: VenueSearchResult) => void;
}

export function RAGResponse({
  ragResponse,
  venues,
  hasSearched,
  onVenueClick,
}: RAGResponseProps) {
  if (!ragResponse && venues.length === 0 && !hasSearched) {
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="เริ่มค้นหาสถานที่"
        description='กรอกสิ่งที่ต้องการและสถานที่ แล้วกด "ค้นหา" หรือ "ถาม AI"'
        iconBgClassName="bg-sky-100"
      />
    );
  }

  if (hasSearched && venues.length === 0 && !ragResponse) {
    return (
      <EmptyState
        icon={<EmptyResultIcon />}
        title="ไม่พบสถานที่"
        description="ลองเปลี่ยนคำค้นหาหรือสถานที่ หรือเพิ่มข้อมูลตัวอย่าง (seed)"
        iconBgClassName="bg-amber-100"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {ragResponse && (
        <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-100">
          <h3 className="text-sm font-semibold text-sky-800 mb-2 flex items-center gap-2">
            <span className="size-2 rounded-full bg-sky-500" />
            คำตอบจาก AI
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {renderMarkdownBold(ragResponse)}
          </p>
        </div>
      )}
      {venues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            สถานที่ที่ค้นเจอ ({venues.length})
          </h3>
          <ul className="space-y-2">
            {venues.map((v) => (
              <li
                key={v.id}
                role={onVenueClick ? "button" : undefined}
                tabIndex={onVenueClick ? 0 : undefined}
                onClick={onVenueClick ? () => onVenueClick(v) : undefined}
                onKeyDown={
                  onVenueClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onVenueClick(v);
                        }
                      }
                    : undefined
                }
                className={`p-3 rounded-lg bg-gray-50/80 border border-gray-100 transition-colors ${
                  onVenueClick
                    ? "cursor-pointer hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm"
                    : ""
                }`}
              >
                <span className="font-medium text-gray-800 block">
                  {v.name}
                </span>
                {v.description && (
                  <span className="block text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {v.description}
                  </span>
                )}
                {v.similarity && (
                  <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    ตรงกัน {(v.similarity * 100).toFixed(0)}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
