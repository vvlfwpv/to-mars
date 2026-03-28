-- 포트폴리오 섹터 테이블
CREATE TABLE IF NOT EXISTS portfolio_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority INTEGER NOT NULL,
  target_weight DECIMAL(5, 2) NOT NULL CHECK (target_weight >= 0 AND target_weight <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포트폴리오 목표 종목 테이블
CREATE TABLE IF NOT EXISTS portfolio_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES portfolio_sectors(id) ON DELETE CASCADE,
  stock_code TEXT NOT NULL,
  stock_name TEXT NOT NULL,
  target_weight DECIMAL(5, 2) NOT NULL CHECK (target_weight >= 0 AND target_weight <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_portfolio_sectors_group_id ON portfolio_sectors(group_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_targets_group_id ON portfolio_targets(group_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_targets_sector_id ON portfolio_targets(sector_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_targets_stock_code ON portfolio_targets(stock_code);

-- RLS 정책 활성화
ALTER TABLE portfolio_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_targets ENABLE ROW LEVEL SECURITY;

-- portfolio_sectors RLS 정책
CREATE POLICY "Users can view their group's portfolio sectors"
  ON portfolio_sectors FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their group's portfolio sectors"
  ON portfolio_sectors FOR INSERT
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their group's portfolio sectors"
  ON portfolio_sectors FOR UPDATE
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their group's portfolio sectors"
  ON portfolio_sectors FOR DELETE
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- portfolio_targets RLS 정책
CREATE POLICY "Users can view their group's portfolio targets"
  ON portfolio_targets FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their group's portfolio targets"
  ON portfolio_targets FOR INSERT
  WITH CHECK (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their group's portfolio targets"
  ON portfolio_targets FOR UPDATE
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their group's portfolio targets"
  ON portfolio_targets FOR DELETE
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));
