CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id BIGSERIAL PRIMARY KEY,
  leaderboard_name TEXT NOT NULL,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL CHECK (score >= 0),
  extra_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (leaderboard_name, player_id)
);

CREATE INDEX IF NOT EXISTS leaderboard_scores_rank_idx
  ON leaderboard_scores (leaderboard_name, score DESC, updated_at ASC, id ASC);
