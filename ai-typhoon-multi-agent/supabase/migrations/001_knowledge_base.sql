-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Knowledge base table for RAG (คู่มือแก้ปัญหา)
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

-- RPC function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(768),
  match_limit int DEFAULT 5,
  match_threshold float DEFAULT 0.5
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.content,
    (1 - (kb.embedding <=> query_embedding))::float AS similarity
  FROM knowledge_base kb
  WHERE kb.embedding IS NOT NULL
    AND (1 - (kb.embedding <=> query_embedding)) >= match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_limit;
END;
$$;
