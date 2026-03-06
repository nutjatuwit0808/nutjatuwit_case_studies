import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from './embedding.service';
import { createSupabaseClient } from '../common/supabase.factory';

export interface KnowledgeMatch {
  id: string;
  content: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly supabase: SupabaseClient | null;

  constructor(private readonly embedding: EmbeddingService) {
    this.supabase = createSupabaseClient();
  }

  async search(
    searchKeywords: string[],
    limit = 5,
    threshold = 0.5,
  ): Promise<KnowledgeMatch[]> {
    if (!this.supabase || searchKeywords.length === 0) {
      return [];
    }

    const queryText = searchKeywords.join(' ');
    const embedding = await this.embedding.embedQuery(queryText);

    const { data, error } = await this.supabase.rpc('match_knowledge_base', {
      query_embedding: embedding,
      match_limit: limit,
      match_threshold: threshold,
    });

    if (error) {
      console.error('RAG search error:', error);
      return [];
    }

    return (data ?? []).map((row: { id: string; content: string; similarity: number }) => ({
      id: row.id,
      content: row.content,
      similarity: Number(row.similarity),
    }));
  }

  formatContext(matches: KnowledgeMatch[]): string {
    return matches
      .map((m, i) => `${i + 1}. ${m.content}`)
      .join('\n\n');
  }
}
