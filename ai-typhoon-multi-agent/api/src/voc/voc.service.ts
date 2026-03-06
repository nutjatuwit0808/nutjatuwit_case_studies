import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AnalyzerOutput } from '../agents/analyzer.service';
import { createSupabaseClient } from '../common/supabase.factory';

export interface VocAnalytics {
  byIntent: Record<string, number>;
  bySentiment: Record<string, number>;
  byUrgency: Record<string, number>;
  byDate: { date: string; count: number }[];
}

@Injectable()
export class VocService {
  private readonly supabase: SupabaseClient | null;

  constructor() {
    this.supabase = createSupabaseClient();
  }

  async saveInteraction(
    sessionId: string,
    rawMessage: string,
    analysis: AnalyzerOutput,
  ): Promise<void> {
    if (!this.supabase) return;

    await this.supabase.from('voc_interactions').insert({
      session_id: sessionId,
      raw_message: rawMessage,
      masked_message: analysis.masked_message,
      intent: analysis.intent,
      sentiment: analysis.sentiment,
      urgency: analysis.urgency,
      search_keywords: analysis.search_keywords,
    });
  }

  async getAnalytics(): Promise<VocAnalytics> {
    const emptyResult: VocAnalytics = {
      byIntent: {},
      bySentiment: {},
      byUrgency: {},
      byDate: [],
    };

    if (!this.supabase) return emptyResult;

    const { data: rows, error } = await this.supabase
      .from('voc_interactions')
      .select('intent, sentiment, urgency, created_at');

    if (error || !rows) return emptyResult;

    const byIntent: Record<string, number> = {};
    const bySentiment: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    const byDateMap: Record<string, number> = {};

    for (const r of rows) {
      byIntent[r.intent] = (byIntent[r.intent] ?? 0) + 1;
      bySentiment[r.sentiment] = (bySentiment[r.sentiment] ?? 0) + 1;
      byUrgency[r.urgency] = (byUrgency[r.urgency] ?? 0) + 1;
      const date = new Date(r.created_at).toISOString().slice(0, 10);
      byDateMap[date] = (byDateMap[date] ?? 0) + 1;
    }

    const byDate = Object.entries(byDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { byIntent, bySentiment, byUrgency, byDate };
  }
}
