---
name: data-fetching-states
description: 데이터 페칭·로딩/에러/빈 상태·뮤테이션 피드백·에러 문구 규칙. useQuery/useMutation을 쓰는 화면을 만들거나 수정할 때, 스켈레톤·ErrorState·EmptyState·토스트·ErrorBoundary를 다룰 때 사용한다.
---

# Data Fetching, Loading & Error States

모든 화면은 **로딩·에러·빈 상태**를 명시적으로 처리한다. 성공 경로만 처리한 화면은 미완성이다.

## Query 레이어

- `QueryClient`는 `src/lib/query-client.ts`에 하나. `src/providers/query-provider.tsx`로 `src/app/_layout.tsx`에 마운트한다. 컴포넌트 안에서 만들지 않는다.
- 전역 기본값(staleTime, `retry: 1`, 네이티브에서 window-focus refetch 끔)은 거기서 설정하고 호출마다 반복하지 않는다.
- 쿼리 키는 `src/features/<feature>/api/query-keys.ts`의 feature별 팩토리. 컴포넌트에 문자열 배열을 흩뿌리지 않는다.
- 서버 접근은 전부 `src/features/<feature>/api/`를 거친다. 컴포넌트가 HTTP 레이어를 직접 부르지 않는다.
- TanStack Query v5: 뮤테이션은 `isLoading`이 아니라 `isPending`.

## 세 가지 상태

| 상태 | 패턴 |
| --- | --- |
| 로딩 | 실제 레이아웃을 닮은 스켈레톤(`src/components/ui/skeleton.tsx`)을 feature 폴더의 화면 단위 스켈레톤으로 조합(예: `episode-card-skeleton.tsx`). 전체 화면 스피너 금지, 데이터 도착 시 레이아웃 이동 없음. |
| 에러 | 쿼리 `refetch`에 연결된 인라인 `<ErrorState message onRetry />`. 사용자는 항상 재시도할 수 있어야 한다. |
| 빈 상태 | Figma 일러스트·문구의 `<EmptyState />`. 빈 스크롤뷰 금지. |

> `ErrorState` / `EmptyState`는 아직 `src/components/ui/`에 없다. 처음 필요한 화면에서 Figma를 읽고 만든다.

## 뮤테이션과 피드백

- 대기 상태는 트리거한 컨트롤에 둔다(비활성화 + 버튼 안 인디케이터). 화면 전체를 막지 않는다.
- 성공/실패 피드백은 **토스트**(`src/providers/toast-provider.tsx` + `useToast()`). 아직 없다 — 만들 때 Reanimated 프리미티브로 자체 제작하고 토스트 라이브러리는 먼저 물어본다.
- `Alert.alert`는 파괴적 확인("정말 삭제할까요?")에만. 검증 오류·성공 메시지에는 쓰지 않는다.

## 에러 경계와 문구

- 예기치 못한 렌더 에러는 `src/app/_layout.tsx`의 `export function ErrorBoundary({ error, retry })`(expo-router 내장)가 잡는다. 라우트 그룹별 폴백이 필요하면 그룹마다 추가한다.
- **서버 원문 메시지·스택·HTTP 상태를 사용자에게 보이지 않는다.** 실패는 `src/constants/error-messages.ts`의 한국어 문구로 매핑하고 일반 폴백 하나를 둔다.
- 원본 에러는 크래시 리포팅으로 보낸다(미설치 — `auth-push-observability` 스킬 참고). 커밋되는 코드에 `console.log`를 남기지 않는다.
