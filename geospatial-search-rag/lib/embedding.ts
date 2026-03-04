import {
  GoogleGenerativeAI,
  TaskType,
  type EmbedContentRequest,
} from "@google/generative-ai";

const EMBEDDING_DIM = 768;

const apiKey =
  process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * สร้าง embedding 768 มิติ (ใช้ร่วมกันโดย embedText และ embedDocument)
 */
async function embedWithTaskType(
  text: string,
  taskType: TaskType.RETRIEVAL_QUERY | TaskType.RETRIEVAL_DOCUMENT
): Promise<number[]> {
  if (!model) {
    throw new Error("GOOGLE_AI_API_KEY or GEMINI_API_KEY is not set");
  }

  const request: EmbedContentRequest & { outputDimensionality?: number } = {
    content: { role: "user", parts: [{ text }] },
    taskType,
    outputDimensionality: EMBEDDING_DIM,
  };

  const result = await model.embedContent(request);
  const values = result.embedding.values;

  if (!values || values.length !== EMBEDDING_DIM) {
    throw new Error(
      `Expected ${EMBEDDING_DIM}-dimensional embedding, got ${values?.length ?? 0}`
    );
  }

  return values;
}

/** สำหรับ query (ค้นหา) - ใช้ RETRIEVAL_QUERY */
export async function embedText(text: string): Promise<number[]> {
  return embedWithTaskType(text, TaskType.RETRIEVAL_QUERY);
}

/** สำหรับ document (indexing) - ใช้ RETRIEVAL_DOCUMENT */
export async function embedDocument(text: string): Promise<number[]> {
  return embedWithTaskType(text, TaskType.RETRIEVAL_DOCUMENT);
}
