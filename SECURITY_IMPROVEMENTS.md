# Security Improvements Summary

이 문서는 2026-03-27에 적용된 보안 개선 사항을 요약합니다.

## 완료된 보안 수정

### 1. API 라우트 인증 체크 추가 ✅

모든 API 엔드포인트에 사용자 인증 검증을 추가했습니다.

**수정된 파일:**
- `/app/api/snapshot/check/route.ts`
- `/app/api/snapshot/check-investment/route.ts`

**변경 내용:**
```typescript
// 모든 API 라우트에 추가된 인증 체크
const supabase = await createServerClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. 데이터베이스 스키마 및 쿼리 업데이트 ✅

모든 테이블과 쿼리에 user_id 필터링을 추가하여 사용자별 데이터 격리를 구현했습니다.

**업데이트된 Type 정의:**
- `/types/balance.ts` - BalanceSnapshot에 user_id 추가
- `/types/investment.ts` - InvestmentSnapshot에 user_id 추가
- `/types/cashflow.ts` - CashflowItem에 user_id 추가
- `/types/owner.ts` - Owner에 user_id 추가

**업데이트된 Query 함수:**
- `/lib/queries/snapshot.ts`
  - checkBalanceSnapshotExists: user_id 필터링 추가
  - checkInvestmentSnapshotExists: user_id 필터링 추가
- `/lib/queries/balance.ts`
  - getBalanceSnapshot: user_id 필터링 추가
  - getAllBalanceSnapshots: user_id 필터링 추가
  - getAllBalanceSnapshotsWithItems: user_id 필터링 추가
  - createBalanceSnapshot: user_id 자동 설정
- `/lib/queries/investment.ts`
  - getInvestmentSnapshot: user_id 필터링 추가
  - getAllInvestmentSnapshots: user_id 필터링 추가
  - getAllInvestmentSnapshotsWithItems: user_id 필터링 추가
  - createInvestmentSnapshot: user_id 자동 설정
- `/lib/queries/cashflow.ts`
  - getAllCashflowItems: user_id 필터링 추가
- `/lib/queries/owner.ts`
  - getAllOwners: user_id 필터링 추가
  - getOwnerById: user_id 필터링 추가

**업데이트된 Action 함수:**
- `/lib/actions/cashflow.ts`
  - createCashflowItem: user_id 자동 설정
- `/lib/actions/owner.ts`
  - createOwner: user_id 자동 설정
  - updateOwner: user_id 필터링 추가
  - deleteOwner: user_id 필터링 추가

**패턴:**
```typescript
// 모든 쿼리에 추가된 패턴
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Unauthorized')

// SELECT 쿼리
.from('table')
.select('*')
.eq('user_id', user.id)  // ← 추가됨

// INSERT 쿼리
.insert({ ...data, user_id: user.id })  // ← user_id 자동 설정
```

### 3. 프로덕션 환경 로깅 제거 ✅

모든 console.log, console.error 문을 개발 환경에서만 실행되도록 수정했습니다.

**수정된 서버 파일:**
- `/app/login/actions.ts` - 로그인 관련 로깅
- `/middleware.ts` - 인증 미들웨어 로깅
- `/app/auth/callback/route.ts` - OAuth 콜백 로깅
- `/app/api/snapshot/check/route.ts` - API 에러 로깅
- `/app/api/snapshot/check-investment/route.ts` - API 에러 로깅

**수정된 클라이언트 컴포넌트:**
- `/components/dashboard/dashboard-client.tsx`
- `/components/cashflow/cashflow-page-client.tsx`
- `/components/cashflow/cashflow-form-dialog.tsx`
- `/components/cashflow/owner-manage-dialog.tsx`
- `/components/balance/balance-page-client.tsx`
- `/components/balance/balance-form-dialog.tsx`
- `/components/balance/balance-copy-dialog.tsx`
- `/components/investment/investment-page-client.tsx`
- `/components/investment/investment-form-dialog.tsx`
- `/components/investment/investment-copy-dialog.tsx`

**변경 패턴:**
```typescript
// Before
console.error('Failed to process:', error)

// After
if (process.env.NODE_ENV === 'development') {
  console.error('Failed to process:', error)
}
```

### 4. 쿠키 보안 플래그 ✅

Supabase SSR (`@supabase/ssr`) 라이브러리가 자동으로 다음과 같은 쿠키 보안 플래그를 설정합니다:

- **HttpOnly**: 인증 토큰 쿠키에 자동으로 적용 (JavaScript 접근 차단)
- **Secure**: HTTPS 환경에서 자동으로 적용
- **SameSite**: CSRF 공격 방지를 위해 적절한 값으로 설정

**현재 구현:**
- `/lib/supabase/client.ts`: Supabase SSR 클라이언트 사용
- `/middleware.ts`: Supabase SSR 미들웨어 사용

**확인사항:**
- ✅ Supabase SSR 라이브러리가 쿠키 보안 자동 처리
- ✅ 프로덕션 배포 시 HTTPS 필수 (Vercel 자동 적용)

### 5. RLS 정책 가이드 문서 생성 ✅

Row Level Security 설정을 위한 상세 가이드를 작성했습니다.

**생성된 문서:**
- `/SECURITY_DATABASE_SETUP.md`

**포함 내용:**
1. 데이터베이스 마이그레이션 SQL
   - user_id 컬럼 추가
   - 인덱스 생성
2. RLS 활성화 SQL
3. 모든 테이블에 대한 RLS 정책 SQL
   - balance_snapshots
   - balance_items
   - investment_snapshots
   - investment_items
   - cashflow_items
   - owners
4. 검증 방법
5. 주의사항 및 실행 순서

## 다음 단계

### 데이터베이스 설정 (수동 작업 필요)

`SECURITY_DATABASE_SETUP.md` 파일의 지침에 따라 Supabase 콘솔에서 다음 작업을 수행해야 합니다:

1. **데이터베이스 백업** (중요!)
2. **user_id 컬럼 추가** (모든 테이블)
3. **인덱스 생성**
4. **RLS 활성화**
5. **RLS 정책 생성**
6. **검증**

### 주의사항

⚠️ **중요:** 데이터베이스 마이그레이션 전에 반드시 백업하세요.

⚠️ **기존 데이터:** 마이그레이션 스크립트는 모든 기존 데이터를 첫 번째 사용자에게 할당합니다. 실제 사용자가 여러 명인 경우 수동으로 데이터를 올바른 사용자에게 할당해야 합니다.

## 보안 체크리스트

- [x] API 라우트에 인증 추가
- [x] 모든 쿼리에 user_id 필터링 추가
- [x] 프로덕션 로깅 제거
- [x] 쿠키 보안 플래그 확인 및 문서화
- [x] RLS 정책 가이드 작성
- [ ] 데이터베이스 마이그레이션 실행 (Supabase 콘솔에서 수동)
- [ ] RLS 정책 적용 (Supabase 콘솔에서 수동)
- [ ] 검증 테스트

## 추가 보안 권장사항

### 1. 환경 변수 보안
- ✅ `.env.local` 파일은 `.gitignore`에 포함
- ⚠️ Supabase URL과 ANON KEY가 Git 히스토리에 노출된 경우:
  - Supabase 프로젝트에서 새 키 발급
  - 환경 변수 업데이트
  - Git 히스토리 정리 고려

### 2. HTTPS 강제
- ✅ Vercel 배포 시 자동으로 HTTPS 적용
- ✅ Supabase SSR이 HTTPS 환경에서 Secure 플래그 자동 설정

### 3. CORS 설정
현재 API 라우트는 Next.js에서 자동으로 동일 출처 정책 적용

### 4. Rate Limiting
향후 고려사항:
- API 라우트에 rate limiting 추가
- Supabase Edge Functions에서 제공하는 rate limiting 활용

### 5. 감사 로그
향후 고려사항:
- 중요한 작업(삭제, 수정)에 대한 감사 로그 추가
- 데이터베이스에 audit_logs 테이블 생성

## 참고 자료

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
