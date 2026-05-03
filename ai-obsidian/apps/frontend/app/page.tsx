"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@ai-obsidian/shared";
import { WORKSHOP_SAMPLE_VAULT_RELATIVE_PATH } from "@ai-obsidian/shared";
import { formatCitationsPlainText } from "@/lib/format-citations";
import {
  DEFAULT_WORKSHOP_QUESTION,
  WORKSHOP_SAMPLE_QUESTIONS,
  postAskAgent,
  postIngestVault,
} from "@/lib/workshop-api";

/** หน้า workshop: ingest vault → ถาม agent → แสดงคำตอบ markdown + citations */
export default function HomePage() {
  const [vaultPath, setVaultPath] = useState(WORKSHOP_SAMPLE_VAULT_RELATIVE_PATH);
  const [question, setQuestion] = useState(DEFAULT_WORKSHOP_QUESTION);
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [status, setStatus] = useState("พร้อมใช้งาน");

  async function ingestVault() {
    setStatus("กำลัง ingest vault...");
    const data = await postIngestVault(vaultPath);
    setStatus(`ingest เสร็จแล้ว: ${data.noteCount} notes / ${data.chunkCount} chunks`);
  }

  async function askAgent() {
    setStatus("กำลังถาม AI Agent...");
    const data = await postAskAgent(question);
    setAnswer(data.answer ?? "");
    setCitations(data.citations ?? []);
    setStatus(`ตอบแล้ว โดยใช้ ${data.chunkCount ?? 0} chunks`);
  }

  return (
    <main>
      <h1>AI Second Brain for Engineers (Obsidian Workshop)</h1>
      <p>{status}</p>

      <section className="card">
        <h2>1) Ingest Obsidian Vault</h2>
        <div className="row">
          <input value={vaultPath} onChange={(e) => setVaultPath(e.target.value)} />
          <button onClick={ingestVault}>Ingest</button>
        </div>
      </section>

      <section className="card">
        <h2>2) Ask Agent</h2>
        <div className="row">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button onClick={askAgent}>Ask</button>
        </div>
        <p className="sample-questions-hint">คำถามตัวอย่างสำหรับทดสอบ (กดแล้วข้อความจะถูกใส่ในช่องด้านบน)</p>
        <div className="sample-questions">
          {WORKSHOP_SAMPLE_QUESTIONS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="chip-btn"
              onClick={() => setQuestion(item.question)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Answer</h2>
        {answer ? (
          <div className="answer-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
          </div>
        ) : (
          <p className="answer-empty">ยังไม่มีคำตอบ</p>
        )}
      </section>

      <section className="card">
        <h2>Citations</h2>
        <pre>{formatCitationsPlainText(citations)}</pre>
      </section>
    </main>
  );
}
