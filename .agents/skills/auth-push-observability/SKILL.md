---
name: auth-push-observability
description: 인증·토큰 저장, 딥링크, 푸시 알림, 크래시 리포팅·분석 규칙. 로그인/로그아웃/토큰 갱신 코드, OAuth 리디렉션, 라우트 경로 변경, expo-notifications·Sentry 도입 작업에서 사용한다.
---

# Auth, Deep Links, Push, Crash Reporting

## 1. 인증과 토큰 저장

첫 로그인에 계정이 자동 생성되므로 별도 가입 플로우가 없다. 로그인 수단: Google(`@react-native-google-signin/google-signin`), Apple(`expo-apple-authentication`) — 코드에 `use-google-sign-in.ts`, `use-apple-sign-in.ts`가 있다.

| 데이터 | 저장소 |
| --- | --- |
| 액세스/리프레시 토큰, OAuth code | **`expo-secure-store`만** (iOS Keychain / Android Keystore) |
| 세션 상태, 프로필, 빵 유형 | 메모리 Zustand 스토어 (`src/features/auth/store/`) |
| 민감하지 않은 설정(온보딩 확인, 설문 초안 등) | `src/lib/storage.ts`의 MMKV 래퍼 |

- 토큰을 MMKV, Zustand `persist`, 쿼리 캐시, `.env`, 로그, URL/쿼리 파라미터에 넣지 않는다.
- `src/features/auth/lib/token-storage.ts`가 SecureStore를 건드리는 **유일한** 모듈이다. 컴포넌트에서 SecureStore를 읽지 않는다.
- 토큰 갱신 경로는 HTTP 레이어(`src/lib/http-client.ts`)에 단일 비행(single-flight)으로 하나 — 동시 401이 병렬 갱신을 일으키지 않는다.
- 갱신 실패 시: SecureStore 비우기, auth 스토어·쿼리 캐시 초기화, 온보딩으로 이동(`src/features/auth/lib/reset-to-onboarding.ts`).
- 크래시 리포트·분석 이벤트에서 토큰을 제거한다.
- OAuth 리디렉션 URI는 `expo-linking`의 `createURL()`로 만든다. 하드코딩 금지.

## 2. 딥링크

- URL 스킴은 `luvinfrontendv2`(`app.json` → `scheme`).
- expo-router가 라우트 트리에서 링크 경로를 만들므로 **`src/app/` 라우트 경로는 공개 계약**이다. 이름을 바꾸면 기존 링크와 알림 페이로드가 깨진다. 이름 변경이 필요하면 사용자에게 알린다.
- URL은 `Linking.createURL()`로 만들고 타입 href로 이동한다. 원시 문자열로 경로를 조립하지 않는다.
- Universal Links / App Links(associated domains, intent filter)는 `app.json` 설정 + 리빌드가 필요하다 — 먼저 묻는다.

## 3. 푸시 알림

**`expo-notifications`는 설치되지 않았고, 승인 없이 푸시 작업을 시작하지 않는다.** dev client는 푸시를 지원한다.

위치: `src/features/notifications/` (권한 요청·토큰 등록·탭 처리 모두 여기, 화면 안에 두지 않는다). 구현 시:

- 권한은 의미 있는 시점(가입 후, 첫 매칭 후)에 요청한다. **첫 실행 때 요청하지 않는다.**
- 푸시 토큰은 로그인 후에만 등록해 사용자 키로 서버에 보내고, 로그아웃 시 지운다.
- 콜드 스타트(알림으로 앱 실행)와 포그라운드 수신을 모두 처리하고, 페이로드에서 만든 타입 href로 이동한다.
- 페이로드는 신뢰하지 않는 입력이다 — 이동 전에 검증하고, 임의 URL로 이동하지 않는다.
- 알림 문구는 제품 카피다 — Figma나 사용자에게서 받고 코드에서 지어내지 않는다.

## 4. 크래시 리포팅 · 분석

**현재 아무것도 설치되어 있지 않다. 결정: 내부 개발 중에는 없이 진행해도 되지만, 첫 외부 빌드(TestFlight / Play 내부 테스트) 전에 크래시 리포팅을 추가해야 한다.**

크래시 리포팅(예정: `@sentry/react-native`):
- 네이티브 리빌드와 `app.json` config plugin 항목이 필요하다 — 설치 전에 묻는다.
- DSN은 `EXPO_PUBLIC_SENTRY_DSN`. 소스맵 업로드 auth 토큰은 **CI 시크릿**이며 커밋하지 않는다.
- `src/lib/sentry.ts`에서 한 번 초기화하고 `src/app/_layout.tsx`에서 호출한다.
- **이벤트·브레드크럼에 PII 금지**: 이메일, 토큰, OAuth code, 설문 응답. 사용자는 서버 측 id로만 식별한다.
- 처리했지만 예기치 못한 실패는 `console.log` 대신 여기로 보고한다.

분석: SDK가 선택되지 않았다. 묻지 않고 SDK를 추가하거나 이벤트 로깅을 직접 만들지 않는다. 도입 시 이벤트명·속성은 `src/constants/` 한 곳에서 정의한다.
