# Database Security Setup Guide

이 문서는 To Mars 앱의 데이터베이스 보안을 강화하기 위한 필수 설정을 안내합니다.

## 개요

현재 데이터베이스에는 사용자별 데이터 격리가 구현되어 있지 않습니다. 모든 테이블에 `user_id` 컬럼을 추가하고 Row Level Security (RLS) 정책을 설정해야 합니다.

## 1. 데이터베이스 마이그레이션

Supabase SQL Editor에서 다음 SQL을 실행하세요.

### 1.1 user_id 컬럼 추가

```sql
-- balance_snapshots 테이블에 user_id 추가
ALTER TABLE balance_snapshots
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 데이터에 user_id 설정 (첫 번째 사용자로 임시 설정)
-- 주의: 프로덕션 환경에서는 적절한 user_id를 수동으로 설정해야 합니다
UPDATE balance_snapshots
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- user_id를 NOT NULL로 변경
ALTER TABLE balance_snapshots
ALTER COLUMN user_id SET NOT NULL;

-- balance_items는 balance_snapshots를 통해 user_id를 참조하므로 직접 추가 불필요
```

```sql
-- investment_snapshots 테이블에 user_id 추가
ALTER TABLE investment_snapshots
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 데이터에 user_id 설정
UPDATE investment_snapshots
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- user_id를 NOT NULL로 변경
ALTER TABLE investment_snapshots
ALTER COLUMN user_id SET NOT NULL;

-- investment_items는 investment_snapshots를 통해 user_id를 참조
```

```sql
-- cashflow_items 테이블에 user_id 추가
ALTER TABLE cashflow_items
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 데이터에 user_id 설정
UPDATE cashflow_items
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- user_id를 NOT NULL로 변경
ALTER TABLE cashflow_items
ALTER COLUMN user_id SET NOT NULL;
```

```sql
-- owners 테이블에 user_id 추가
ALTER TABLE owners
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 데이터에 user_id 설정
UPDATE owners
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- user_id를 NOT NULL로 변경
ALTER TABLE owners
ALTER COLUMN user_id SET NOT NULL;
```

### 1.2 인덱스 추가 (성능 최적화)

```sql
-- user_id에 인덱스 추가
CREATE INDEX idx_balance_snapshots_user_id ON balance_snapshots(user_id);
CREATE INDEX idx_investment_snapshots_user_id ON investment_snapshots(user_id);
CREATE INDEX idx_cashflow_items_user_id ON cashflow_items(user_id);
CREATE INDEX idx_owners_user_id ON owners(user_id);
```

## 2. Row Level Security (RLS) 활성화

### 2.1 RLS 활성화

```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashflow_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
```

### 2.2 RLS 정책 생성

#### balance_snapshots 정책

```sql
-- SELECT: 자신의 데이터만 조회
CREATE POLICY "Users can view their own balance snapshots"
ON balance_snapshots
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: 자신의 데이터만 생성
CREATE POLICY "Users can create their own balance snapshots"
ON balance_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 자신의 데이터만 수정
CREATE POLICY "Users can update their own balance snapshots"
ON balance_snapshots
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: 자신의 데이터만 삭제
CREATE POLICY "Users can delete their own balance snapshots"
ON balance_snapshots
FOR DELETE
USING (auth.uid() = user_id);
```

#### balance_items 정책

```sql
-- SELECT: 자신의 snapshot에 속한 items만 조회
CREATE POLICY "Users can view their own balance items"
ON balance_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM balance_snapshots
    WHERE balance_snapshots.id = balance_items.snapshot_id
    AND balance_snapshots.user_id = auth.uid()
  )
);

-- INSERT: 자신의 snapshot에만 items 생성
CREATE POLICY "Users can create balance items for their snapshots"
ON balance_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM balance_snapshots
    WHERE balance_snapshots.id = balance_items.snapshot_id
    AND balance_snapshots.user_id = auth.uid()
  )
);

-- UPDATE: 자신의 items만 수정
CREATE POLICY "Users can update their own balance items"
ON balance_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM balance_snapshots
    WHERE balance_snapshots.id = balance_items.snapshot_id
    AND balance_snapshots.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM balance_snapshots
    WHERE balance_snapshots.id = balance_items.snapshot_id
    AND balance_snapshots.user_id = auth.uid()
  )
);

-- DELETE: 자신의 items만 삭제
CREATE POLICY "Users can delete their own balance items"
ON balance_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM balance_snapshots
    WHERE balance_snapshots.id = balance_items.snapshot_id
    AND balance_snapshots.user_id = auth.uid()
  )
);
```

#### investment_snapshots 정책

```sql
-- SELECT
CREATE POLICY "Users can view their own investment snapshots"
ON investment_snapshots
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create their own investment snapshots"
ON investment_snapshots
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own investment snapshots"
ON investment_snapshots
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own investment snapshots"
ON investment_snapshots
FOR DELETE
USING (auth.uid() = user_id);
```

#### investment_items 정책

```sql
-- SELECT
CREATE POLICY "Users can view their own investment items"
ON investment_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM investment_snapshots
    WHERE investment_snapshots.id = investment_items.snapshot_id
    AND investment_snapshots.user_id = auth.uid()
  )
);

-- INSERT
CREATE POLICY "Users can create investment items for their snapshots"
ON investment_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM investment_snapshots
    WHERE investment_snapshots.id = investment_items.snapshot_id
    AND investment_snapshots.user_id = auth.uid()
  )
);

-- UPDATE
CREATE POLICY "Users can update their own investment items"
ON investment_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM investment_snapshots
    WHERE investment_snapshots.id = investment_items.snapshot_id
    AND investment_snapshots.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM investment_snapshots
    WHERE investment_snapshots.id = investment_items.snapshot_id
    AND investment_snapshots.user_id = auth.uid()
  )
);

-- DELETE
CREATE POLICY "Users can delete their own investment items"
ON investment_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM investment_snapshots
    WHERE investment_snapshots.id = investment_items.snapshot_id
    AND investment_snapshots.user_id = auth.uid()
  )
);
```

#### cashflow_items 정책

```sql
-- SELECT
CREATE POLICY "Users can view their own cashflow items"
ON cashflow_items
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create their own cashflow items"
ON cashflow_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own cashflow items"
ON cashflow_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own cashflow items"
ON cashflow_items
FOR DELETE
USING (auth.uid() = user_id);
```

#### owners 정책

```sql
-- SELECT
CREATE POLICY "Users can view their own owners"
ON owners
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can create their own owners"
ON owners
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own owners"
ON owners
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own owners"
ON owners
FOR DELETE
USING (auth.uid() = user_id);
```

## 3. 애플리케이션 코드 업데이트

데이터베이스 마이그레이션과 RLS 설정이 완료된 후, 다음 파일들을 업데이트해야 합니다:

### 3.1 Type 정의 업데이트

- `/types/balance.ts`: BalanceSnapshot에 user_id 추가
- `/types/investment.ts`: InvestmentSnapshot에 user_id 추가
- `/types/cashflow.ts`: CashflowItem에 user_id 추가
- `/types/owner.ts`: Owner에 user_id 추가

### 3.2 Query 함수 업데이트

모든 쿼리에 user_id 필터링 추가:

- `/lib/queries/balance.ts`
- `/lib/queries/investment.ts`
- `/lib/queries/cashflow.ts`
- `/lib/queries/owner.ts`
- `/lib/queries/snapshot.ts`

### 3.3 Action 함수 업데이트

모든 INSERT/UPDATE 작업에 user_id 자동 설정:

- `/lib/actions/balance.ts`
- `/lib/actions/investment.ts`
- `/lib/actions/cashflow.ts`
- `/lib/actions/owner.ts`

## 4. 검증

RLS가 올바르게 동작하는지 확인:

```sql
-- 다른 사용자의 데이터를 조회할 수 없어야 함
SELECT * FROM balance_snapshots WHERE user_id != auth.uid();
-- 결과: 0 rows (RLS가 차단)

-- 자신의 데이터만 조회 가능해야 함
SELECT * FROM balance_snapshots WHERE user_id = auth.uid();
-- 결과: 자신의 데이터만 반환
```

## 5. 주의사항

1. **기존 데이터**: 위의 마이그레이션은 모든 기존 데이터를 첫 번째 사용자에게 할당합니다. 프로덕션 환경에서는 데이터를 올바른 사용자에게 수동으로 할당해야 합니다.

2. **백업**: 마이그레이션 전에 반드시 데이터베이스를 백업하세요.

3. **테스트**: 개발 환경에서 먼저 테스트한 후 프로덕션에 적용하세요.

4. **Service Role**: RLS는 일반 사용자 요청에만 적용됩니다. Service Role을 사용하는 경우 RLS가 우회되므로 주의하세요.

## 6. 실행 순서

1. 데이터베이스 백업
2. 1.1의 SQL 실행 (user_id 컬럼 추가)
3. 1.2의 SQL 실행 (인덱스 추가)
4. 2.1의 SQL 실행 (RLS 활성화)
5. 2.2의 SQL 실행 (RLS 정책 생성)
6. 애플리케이션 코드 업데이트 (섹션 3)
7. 검증 (섹션 4)
