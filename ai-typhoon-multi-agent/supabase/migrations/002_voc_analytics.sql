-- VoC (Voice of Customer) analytics table
CREATE TABLE voc_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  raw_message TEXT,
  masked_message TEXT NOT NULL,
  intent TEXT NOT NULL,
  sentiment TEXT NOT NULL,
  urgency TEXT NOT NULL,
  search_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX idx_voc_interactions_intent ON voc_interactions (intent);
CREATE INDEX idx_voc_interactions_sentiment ON voc_interactions (sentiment);
CREATE INDEX idx_voc_interactions_created_at ON voc_interactions (created_at DESC);
CREATE INDEX idx_voc_interactions_session_id ON voc_interactions (session_id);
