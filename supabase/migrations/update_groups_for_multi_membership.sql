-- 그룹 멤버십을 여러 개 가질 수 있도록 unique constraint 제거
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS unique_user_per_group;

-- 대신 (group_id, user_id) 조합이 유니크하도록 변경
ALTER TABLE group_members ADD CONSTRAINT unique_group_user_pair UNIQUE(group_id, user_id);

-- groups 테이블에 필드 추가
ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_read_only BOOLEAN DEFAULT false;

-- Sample Group 생성
INSERT INTO groups (id, name, description, is_sample, is_read_only)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Sample Group',
  '모든 사용자가 접근 가능한 샘플 그룹입니다',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_sample = true,
  is_read_only = true;

-- 모든 기존 사용자를 Sample Group에 추가
INSERT INTO group_members (group_id, user_id)
SELECT '00000000-0000-0000-0000-000000000000', id
FROM auth.users
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Sample Group에 샘플 데이터 추가는 별도 스크립트로 진행
