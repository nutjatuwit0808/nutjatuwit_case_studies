"use client";

import { useState, useEffect } from "react";
import { fetchSchema, type SchemaTable } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

/** Hook สำหรับโหลด schema tables พร้อม loading และ error state */
export function useSchema() {
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchema()
      .then(setTables)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return { tables, loading, error };
}
