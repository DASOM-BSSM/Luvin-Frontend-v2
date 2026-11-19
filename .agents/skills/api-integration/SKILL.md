---
name: api-integration
description: 백엔드 API 연동 규칙 — axios 인스턴스, OpenAPI 스펙(docs/api/openapi.json)에서 타입 생성, feature별 API 함수·쿼리 키. 새 openapi.json을 받았거나 API 함수를 추가·수정할 때 사용한다.
---

# API Integration (OpenAPI + axios)

> 초안: 실제 백엔드 `openapi.json` 구조에 대한 검토가 아직 안 끝났다.

## HTTP 클라이언트

- axios 인스턴스는 **`src/lib/http-client.ts`에 하나만** 둔다. 컴포넌트·feature 파일에서 `axios.create()`를 부르지 않는다. 응답 봉투 처리는 `src/lib/api-envelope.ts`.
- `baseURL`은 `EXPO_PUBLIC_API_URL`에서 읽는다(`.env.example`에 있음).
- 인증 헤더는 요청 인터셉터에서 자동으로 붙이되, 토큰 값은 `src/features/auth/lib/token-storage.ts`로만 읽는다 — 인터셉터 코드도 예외 없음.
- 401 처리는 인터셉터 안에서 single-flight 갱신(자세한 규칙은 `auth-push-observability` 스킬 §1).

## OpenAPI 스펙 → 생성 타입

- 백엔드에서 받은 OpenAPI 3.1 JSON은 **`docs/api/openapi.json`** 에 둔다. API 표면의 단일 출처이며, 백엔드 저장소를 뒤져 엔드포인트를 추측하지 않는다.
- 타입은 `openapi-typescript`로 **`src/types/api-generated.ts`** 에 생성한다 (파일 머리에 자동 생성 표시, 손으로 수정 금지, ESLint 제외 대상).
- 생성 명령: `pnpm generate:api-types` (`pnpm dlx openapi-typescript@<고정 버전>`을 호출하며, devDependency로 설치하지 않는다).
- **새 스펙을 받으면**:
  1. 추가·변경된 엔드포인트를 요약해서 사용자에게 알린다.
  2. `docs/api/openapi.json`을 교체한다.
  3. `pnpm generate:api-types`를 다시 실행한다.
  4. `pnpm typecheck`로 기존 API 함수·컴포넌트의 타입 오류를 확인한다.
  5. 오류를 고치고 변경 요약을 보고한다.

## API 함수와 쿼리

- 요청 함수는 `src/features/<feature>/api/`에 두고 `api-generated.ts`의 타입을 그대로 쓴다. 요청·응답에 `any` 금지.
- 쿼리 키는 `src/features/<feature>/api/query-keys.ts`.
- 컴포넌트는 axios나 API 함수를 직접 부르지 않고 `useQuery` / `useMutation`을 거친다. (로딩·에러·빈 상태는 `data-fetching-states` 스킬)
- 스펙에 없는 엔드포인트를 추측하지 않는다 — 기대한 것이 없으면 사용자에게 묻는다.
