const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type TableColumn = { name: string; type: string };
export type SchemaTable = { table_name: string; columns: TableColumn[] };

export async function fetchSchema(): Promise<SchemaTable[]> {
  const res = await fetch(`${API_URL}/api/schema`);
  if (!res.ok) {
    throw new Error(res.status === 503 ? "ไม่สามารถเชื่อมต่อ schema ได้" : res.statusText);
  }
  const data = await res.json();
  return data.tables ?? [];
}

export type ChatToSqlResponse = {
  sql: string;
  result: Record<string, unknown>[];
  error: string | null;
  system_prompt?: string | null;
  user_prompt?: string | null;
};

export async function chatToSql(question: string): Promise<ChatToSqlResponse> {
  const res = await fetch(`${API_URL}/api/chat-to-sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || res.statusText);
  }
  return data;
}
