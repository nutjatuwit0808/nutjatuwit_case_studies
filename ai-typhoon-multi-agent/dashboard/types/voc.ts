export interface VocAnalytics {
  byIntent: Record<string, number>;
  bySentiment: Record<string, number>;
  byUrgency: Record<string, number>;
  byDate: { date: string; count: number }[];
}
