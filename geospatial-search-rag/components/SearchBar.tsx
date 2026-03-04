"use client";

import { useState, useCallback } from "react";

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async () => {
      setValidationError(null);
      const q = query.trim();

      if (!q) {
        setValidationError("กรุณาระบุสิ่งที่ต้องการค้นหา");
        return;
      }

      await onSearch(q);
    },
    [query, onSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            สิ่งที่ต้องการ
          </label>
          <input
            type="text"
            placeholder="เช่น คาเฟ่เงียบๆ, ร้านอาหารญี่ปุ่น"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setValidationError(null);
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors disabled:opacity-60 disabled:bg-gray-50"
            disabled={loading}
          />
        </div>
      </div>

      {validationError && (
        <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          {validationError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-white/80 animate-pulse" />
            กำลังค้นหา...
          </span>
        ) : (
          "ค้นหา"
        )}
      </button>
    </div>
  );
}
