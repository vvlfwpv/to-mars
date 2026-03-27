# Investment Items에 Currency 추가

investment_items 테이블에 통화 정보를 추가합니다.

## Supabase SQL Editor에서 실행

### 1. currency 컬럼 추가

```sql
-- currency 컬럼 추가 (기본값: KRW)
ALTER TABLE investment_items
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW' NOT NULL;

-- 기존 데이터: 카테고리에 따라 currency 설정
UPDATE investment_items
SET currency = 'USD'
WHERE category IN ('해외주식', '해외ETF');

-- 나머지는 KRW로 유지 (이미 기본값)
```

### 2. 확인

```sql
-- currency 분포 확인
SELECT
  category,
  currency,
  COUNT(*) as count
FROM investment_items
GROUP BY category, currency
ORDER BY category, currency;
```

예상 결과:
```
category    | currency | count
------------|----------|------
국내주식    | KRW      | X
해외주식    | USD      | X
해외ETF      | USD      | X
```

## 참고

- **KRW**: 원화 (국내주식, 기타)
- **USD**: 달러 (해외주식, 해외ETF)

currency 컬럼은 향후 다른 통화(EUR, JPY 등) 추가 시에도 확장 가능합니다.
