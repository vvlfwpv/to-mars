# Database Migration: User-based to Group-based

이 마이그레이션은 user_id 기반 데이터 구조를 group_id 기반으로 변경합니다.
한 그룹의 여러 사용자가 같은 데이터를 공유할 수 있습니다.

## ⚠️ 중요: 백업 필수
마이그레이션 전 반드시 데이터베이스를 백업하세요!

## 실행 순서

Supabase SQL Editor에서 아래 SQL을 **순서대로** 실행하세요.

---

## Step 1: groups 테이블 생성

```sql
-- groups 테이블 생성
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 추가
CREATE INDEX idx_groups_created_at ON groups(created_at);
```

---

## Step 2: group_members 테이블 생성

```sql
-- group_members 테이블 생성
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- 한 사용자는 한 그룹만 속할 수 있음
  CONSTRAINT unique_user_per_group UNIQUE(user_id)
);

-- 인덱스 추가
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

---

## Step 3: 기본 그룹 생성 및 사용자 추가

```sql
-- 기본 그룹 생성
INSERT INTO groups (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Group')
ON CONFLICT (id) DO NOTHING;

-- 모든 기존 사용자를 기본 그룹에 추가
INSERT INTO group_members (group_id, user_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

---

## Step 4: balance_snapshots에 group_id 추가

```sql
-- group_id 컬럼 추가
ALTER TABLE balance_snapshots
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- 기존 데이터의 user_id를 group_id로 변환
-- (user_id가 속한 그룹을 찾아서 group_id 설정)
UPDATE balance_snapshots bs
SET group_id = gm.group_id
FROM group_members gm
WHERE bs.user_id = gm.user_id
AND bs.group_id IS NULL;

-- group_id를 NOT NULL로 변경
ALTER TABLE balance_snapshots
ALTER COLUMN group_id SET NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_balance_snapshots_group_id ON balance_snapshots(group_id);

-- user_id 컬럼 삭제
ALTER TABLE balance_snapshots
DROP COLUMN IF EXISTS user_id;
```

---

## Step 5: investment_snapshots에 group_id 추가

```sql
-- group_id 컬럼 추가
ALTER TABLE investment_snapshots
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- 기존 데이터의 user_id를 group_id로 변환
UPDATE investment_snapshots ins
SET group_id = gm.group_id
FROM group_members gm
WHERE ins.user_id = gm.user_id
AND ins.group_id IS NULL;

-- group_id를 NOT NULL로 변경
ALTER TABLE investment_snapshots
ALTER COLUMN group_id SET NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_investment_snapshots_group_id ON investment_snapshots(group_id);

-- user_id 컬럼 삭제
ALTER TABLE investment_snapshots
DROP COLUMN IF EXISTS user_id;
```

---

## Step 6: cashflow_items에 group_id 추가

```sql
-- group_id 컬럼 추가
ALTER TABLE cashflow_items
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- 기존 데이터의 user_id를 group_id로 변환
UPDATE cashflow_items ci
SET group_id = gm.group_id
FROM group_members gm
WHERE ci.user_id = gm.user_id
AND ci.group_id IS NULL;

-- group_id를 NOT NULL로 변경
ALTER TABLE cashflow_items
ALTER COLUMN group_id SET NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_cashflow_items_group_id ON cashflow_items(group_id);

-- user_id 컬럼 삭제
ALTER TABLE cashflow_items
DROP COLUMN IF EXISTS user_id;
```

---

## Step 7: owners에 group_id 추가

```sql
-- group_id 컬럼 추가
ALTER TABLE owners
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- 기존 데이터의 user_id를 group_id로 변환
UPDATE owners o
SET group_id = gm.group_id
FROM group_members gm
WHERE o.user_id = gm.user_id
AND o.group_id IS NULL;

-- group_id를 NOT NULL로 변경
ALTER TABLE owners
ALTER COLUMN group_id SET NOT NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_owners_group_id ON owners(group_id);

-- user_id 컬럼 삭제
ALTER TABLE owners
DROP COLUMN IF EXISTS user_id;
```

---

## Step 8: RLS 정책 업데이트 (선택사항)

RLS를 사용하는 경우, 기존 user_id 기반 정책을 group_id 기반으로 변경해야 합니다.

```sql
-- 기존 RLS 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view their own balance snapshots" ON balance_snapshots;
DROP POLICY IF EXISTS "Users can create their own balance snapshots" ON balance_snapshots;
DROP POLICY IF EXISTS "Users can update their own balance snapshots" ON balance_snapshots;
DROP POLICY IF EXISTS "Users can delete their own balance snapshots" ON balance_snapshots;

-- 새로운 그룹 기반 RLS 정책
CREATE POLICY "Users can view their group's balance snapshots"
ON balance_snapshots
FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create balance snapshots for their group"
ON balance_snapshots
FOR INSERT
WITH CHECK (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their group's balance snapshots"
ON balance_snapshots
FOR UPDATE
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their group's balance snapshots"
ON balance_snapshots
FOR DELETE
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);
```

위 패턴을 investment_snapshots, balance_items, investment_items, cashflow_items, owners에도 동일하게 적용하세요.

---

## 검증

마이그레이션 완료 후 확인:

```sql
-- 그룹 확인
SELECT * FROM groups;

-- 그룹 멤버 확인
SELECT gm.*, u.email
FROM group_members gm
JOIN auth.users u ON gm.user_id = u.id;

-- 데이터 확인 (group_id가 모두 설정되었는지)
SELECT 'balance_snapshots' as table_name, COUNT(*) as total, COUNT(group_id) as with_group_id FROM balance_snapshots
UNION ALL
SELECT 'investment_snapshots', COUNT(*), COUNT(group_id) FROM investment_snapshots
UNION ALL
SELECT 'cashflow_items', COUNT(*), COUNT(group_id) FROM cashflow_items
UNION ALL
SELECT 'owners', COUNT(*), COUNT(group_id) FROM owners;
```

---

## 롤백 방법

문제가 발생한 경우:
1. 백업에서 복원
2. 또는 group_id를 user_id로 다시 변환

```sql
-- 롤백 예시 (balance_snapshots)
ALTER TABLE balance_snapshots ADD COLUMN user_id UUID;
UPDATE balance_snapshots bs
SET user_id = gm.user_id
FROM group_members gm
WHERE bs.group_id = gm.group_id;
```

---

## 완료 후

데이터베이스 마이그레이션이 완료되면 애플리케이션 코드를 배포하세요.
