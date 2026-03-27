# Investment 카테고리 업데이트

기존 카테고리명을 새로운 명칭으로 변경합니다.

## 변경 내용

- 한국주식 → 국내주식
- 미국주식 → 해외주식
- 미국ETF → 해외ETF

## Supabase SQL Editor에서 실행

```sql
-- investment_items 테이블의 카테고리 업데이트
UPDATE investment_items
SET category = '국내주식'
WHERE category = '한국주식';

UPDATE investment_items
SET category = '해외주식'
WHERE category = '미국주식';

UPDATE investment_items
SET category = '해외ETF'
WHERE category = '미국ETF';
```

## 확인

```sql
-- 업데이트된 카테고리 확인
SELECT DISTINCT category
FROM investment_items
ORDER BY category;
```

예상 결과:
- 국내주식
- 해외주식
- 해외ETF
- (기타 사용자가 입력한 카테고리들)

## 참고

- 이 업데이트는 기존 데이터에만 영향을 줍니다
- 새로 입력하는 데이터는 UI에서 새로운 카테고리명으로 입력하면 됩니다
- 카테고리는 자유 입력이므로 기존 다른 카테고리명은 그대로 유지됩니다
