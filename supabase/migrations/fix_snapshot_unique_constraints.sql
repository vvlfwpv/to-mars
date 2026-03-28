-- Balance Snapshots: 잘못된 unique constraint 제거 및 올바른 constraint 추가
-- 기존 constraint 제거
ALTER TABLE balance_snapshots
DROP CONSTRAINT IF EXISTS balance_snapshots_year_month_key;

-- 올바른 unique constraint 추가 (group_id, year, month 조합)
ALTER TABLE balance_snapshots
ADD CONSTRAINT balance_snapshots_group_year_month_key
UNIQUE (group_id, year, month);

-- Investment Snapshots: 잘못된 unique constraint 제거 및 올바른 constraint 추가
-- 기존 constraint 제거
ALTER TABLE investment_snapshots
DROP CONSTRAINT IF EXISTS investment_snapshots_year_month_key;

-- 올바른 unique constraint 추가 (group_id, year, month 조합)
ALTER TABLE investment_snapshots
ADD CONSTRAINT investment_snapshots_group_year_month_key
UNIQUE (group_id, year, month);
