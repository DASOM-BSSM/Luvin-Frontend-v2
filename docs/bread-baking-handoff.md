# LUV-88 빵굽기 미니게임 인계

> **2026-10-30: PR #66 (feat/LUV-88 → dev) 열림** — 커밋 `23e43ee`. 원본 백업(`originals/`)·`*-hires.png`·다른 작업(inferno 등)·AGENTS.md §20 은 커밋하지 않았다. 남은 것: 백엔드 `salt_bread_baking` 등록 후 토큰 지급 확인, Android 확인.

갱신: 2026-10-29 오후 (Asia/Seoul). 작업 브랜치: `feat/LUV-88`.

## 먼저 확인

- 사용자는 앞으로 모든 작업을 다른 에이전트가 이어받을 수 있도록 기록하라고 요청했다. 의미 있는 변경 후 이 문서를 갱신한다.
- 계정 사용량 잔여가 5% 이하라고 확인되면 즉시 모든 작업을 멈춘다. 현재 도구의 goal token accounting에는 계정 잔여 사용량 비율이 없다. 자동 감지를 약속하지 않는다.
- `git status --short`, `git branch --show-current`, 실제 파일과 실행 상태부터 확인한다. 아래 런타임 기록은 마지막 관찰이며 현재 상태를 보장하지 않는다.
- 시작 당시 `feat/LUV-82`에 다른 작업의 수정/미추적 파일이 다수 있었다. 이를 유지한 채 `feat/LUV-88`을 생성했다. 기존 변경을 되돌리거나 LUV-88 변경으로 일괄 커밋하지 않는다. 커밋/푸시하지 않았다.

## 요청과 확정 사항

- Jira: https://dasom-bssm.atlassian.net/browse/LUV-88 (제목: 빵굽기 미니게임, 확인 당시 별도 설명 없음).
- 사용자 확정 조작: **드래그**.
- 순서: 빈 그릇 준비 → 밀가루·계란 섞기 → 버터·물 섞기(2026-10-29 사용자 요청으로 버터를 물보다 먼저) → 소금·설탕·이스트 섞기 → 도마로 옮기기·밀기·버터 넣기·성형 → 오븐 투입·리듬에 맞춰 꺼내기.
- Figma `Luvin-Design`: 1~3단계 `5726:2608`, 4~5단계 `7966:6180`, 6단계 `7966:6239`.
- 최신 추가 에셋 프레임 `7975:2356`, 빈 그릇 `7967:2330`. 옛 추가 에셋 `7964:2283`은 조회되지 않았다.
- 파일 키는 저장하지 않는다. 필요하면 이 채팅의 사용자 제공 Figma 링크를 사용하거나 사용자에게 요청한다. Figma 도구 호출 전에 해당 스킬을 읽는다.

## 이 작업에서 만든/수정한 파일

- `src/app/luvin-hell/bread-baking/play.tsx`: 플레이 라우트, 화면 수명/설명/나가기 처리.
- `src/features/bread-baking/types/`, `utils/`, `hooks/`, `components/`: 상태 머신, 드롭/이동거리 계산, 시계, 단계별 씬.
- `src/assets/images/bread-baking/`: Figma PNG 25개 및 `BakingAsset.tsx`. expo-image의 NativeWind 스타일에는 `cssInterop`이 필요하다.
- `src/constants/typography.ts`: `bakingLayout` 추가.
- `tailwind.config.js`: `bakingLayout` spacing/width 연결.
- `src/app/luvin-hell/index.tsx`: 임시 빵굽기 진입 버튼 추가.
- 이 인계 문서와 `AGENTS.md` §20.
- 위 외의 package/lockfile, API spec, inferno/auth/welcome 등 다수 변경은 시작 전부터 존재했다.

## 현재 동작과 수정 이유

- 빈 그릇은 준비 화면에서 자동 준비한다. 시작하면 `flour` 단계로 간다. 그릇을 먼저 움직여야 했던 숨은 조건 때문에 재료가 잠겨 보이는 문제를 제거했다.
- `BakingSprite`는 안정적인 `PanResponder`와 최신 props ref를 사용한다. 시작·이동·놓기의 `pageX/pageY`를 추적하고 놓기 좌표도 포함한다. 이전 RNGH 처리에서는 실제 드롭 이동량이 0으로 기록됐다.
- `utils/drag.ts`의 `measureWorkDistance`는 선분과 작업 영역의 교차 길이를 계산한다. 그릇 밖→안으로 빠르게 이동해 중간 이벤트가 적어도 섞기 거리가 누락되지 않는다.
- 플레이 중 ScrollView 스크롤은 꺼서 세로 드래그와 충돌하지 않게 했다. 작은 화면에서 하단 접근성은 추가 확인이 필요하다.
- 현재 초기 규칙: 180초, 3개 완성, 1초 박자, 4번째 박자 ±250ms에 꺼내기, 도구 이동 120, 완성 표시 750ms. 미세 게임 규칙은 사용자와 최종 조율 전의 초기 구현이다.
- 설명/나가기 모달, 앱 백그라운드, 다른 라우트에서는 시계를 멈춘다. 잘못된 재료 순서/중복 입력은 무시한다.

### 오븐 박자 구분·실패 피드백 (2026-10-29 추가 → 같은 날 아래 타이머 개편으로 대체)

> 박자 연출(`isOvenLit`, `pulseMs`, 드래그로 꺼내기, 탄 빵을 오븐 안에 표시)은 타이머 개편에서 **삭제됐다**. 아래는 기록용이다. `ovenResult`·`serve` 유지·`getBakingInstruction(state)`는 그대로 쓴다.

- 사용자 결정: **Figma에 있는 에셋(불 켜진 오븐 `lit-oven`, 탄 빵 `burnt-bread`)만 사용, 새 문구·모양 추가 금지.** Figma `7966:6239`(6단계)·`7975:2356`(에셋)·`5726:2608`에는 박자 표시/실패 문구/하트가 없음을 확인했다. UI Design 페이지 전체 메타데이터는 응답이 너무 커서 조회 실패 — 다른 프레임에 시안이 있을 가능성은 남아 있다.
- 박자: `isOvenLit` (utils/game.ts). 1~3박자는 `pulseMs`(150ms) 동안만, 4번째 박자는 판정 창 전체(±250ms) 동안 `litOven`. 짧게 번쩍 vs 길게 켜짐으로 구분한다. 투명도 등 새 시각 값은 쓰지 않았다.
- 결과: `BakingState.ovenResult` (`baked`/`burnt`/`raw`). 실패도 성공처럼 `serve` 단계에서 `resultHoldMs`(750ms) 동안 보여준 뒤 `flour`로 돌아간다(그동안 입력 무시).
  - 일찍 꺼냄 → `raw`: 트레이 위 반죽(`saltBread`).
  - 4.25초 초과 → `burnt`: 오븐 안 위치에 탄 빵. 성공 → `baked`: 트레이 위 구운 빵(기존과 동일).
- 실패 중 설명 모달은 `serve`의 "완성!" 문구 대신 밀가루 안내를 보여준다(`getBakingInstruction(state)`).
- 수정 파일: `types/index.ts`, `utils/game.ts`, `utils/instructions.ts`, `components/baking-oven-scene.tsx`, `src/app/luvin-hell/bread-baking/play.tsx`.

### 도구 제스처 판정 완화 (2026-10-29 추가)

- 문제: 거품기·밀대·성형이 거의 성공하지 않았다. 위치/이동거리를 **스프라이트 중심**(슬롯 중심 + 이동량)으로 계산해, 거품기 손잡이를 잡으면 손가락은 그릇 안인데 계산점은 그릇 밖이라 거리가 쌓이지 않고 놓기도 거절됐다. 또 놓을 때만 판정해 충분히 저었는지 알 수 없었다.
- 사용자 승인 변경 A+B만 적용(C: `toolTravel` 120 하향은 미승인 → 그대로).
  - A: 모든 스프라이트 판정을 **손가락 위치**(GameFrame 로컬 = `bakingLayout` 좌표)로 한다. 잡을 때 `slot + locationX/Y`, 이후 `pageX/Y` 변화량을 더한다. 작업 영역 거리 누적과 놓기 좌표 모두 손가락 기준.
  - B: 도구 3종은 드래그 중 작업 영역 안 거리가 120에 닿는 순간 바로 진행한다(놓기 불필요). 터치당 한 번만 발동하고, 발동 즉시 제자리로 돌아가며 그 터치의 이후 이동·놓기는 무시한다. 재료·그릇·오븐 빵은 기존처럼 놓을 때 판정.
- 수정 파일: `utils/drag.ts`(`DragTouch`, `startDragTouch`, `getFingerPoint`, `moveDragTouch` 순수 함수 추가), `components/baking-sprite.tsx`(손가락 기준 추적, `onTravel` prop, settled 터치 무시), `components/baking-mixing-scene.tsx`·`baking-shaping-scene.tsx`(`handle*Drop` → `handleWhiskTravel`/`handleRollTravel`/`handleShapeTravel`, `onTravel`로 연결).
- 검증: `pnpm tsc --noEmit` 통과, 수정 파일 `git diff --check` 통과. scratchpad Node(`--experimental-strip-types`) 스크립트로 손가락 좌표 계산, 손잡이를 잡은 거품기(중심은 그릇 밖)도 그릇 안에서 40px×3 젓기에 정확히 1회 발동, 발동 후 이동 무시·재발동 없음, 작업 영역 밖 이동 미집계/가로지르기 교차 길이, 119.9 미발동·120 발동, 목표 없는 스프라이트는 settled 안 됨 + 놓기 좌표 = 손가락, 밀대가 도마 밖→안 진입 시 안쪽 거리만 집계, 입력 불변을 확인했다.
- **iOS/Android 실기기 체감은 미검증.** 시뮬레이터는 다른 작업이 사용 중이라 코드 수준 검증만 했다.
- 알려진 차이/위험: 그릇(`doughBowl` y 334~459)과 도마 타깃(y 226~361)이 겹쳐, `transfer` 단계에서 그릇 윗부분(y ≤ 361)을 **움직이지 않고 탭만 해도** 도마로 옮겨진다(이전엔 중심점 y≈396이라 불가). 다른 드롭(재료→그릇, 버터→도마, 빵→오븐/트레이)은 시작 슬롯과 타깃이 겹치지 않아 탭 오발동은 없다. 손가락이 타깃 밖이면 그림이 타깃에 걸쳐 있어도 실패한다.
- 안내 문구 불일치: `utils/instructions.ts`의 "움직인 뒤 놓아주세요"는 B 이후 놓기 전에 진행되므로 약간 부정확하다. 사용자가 문구 변경을 금지해 그대로 두었다.

## 검증 기록과 한계

- 마지막 코드 변경 후 `pnpm tsc --noEmit` 통과. `git diff --check` 통과.
- 임시 Node 스크립트로 순서·3개 성공·잘못된 입력·타이밍·타임아웃·초기화 검증 통과.
- 드래그 핸들러의 시계 리렌더 중 유지, 최신 콜백, 놓기만 수신한 입력, 취소·비활성 입력 검증 통과.
- 작업 영역 교차 길이: 양방향·영역 밖·평행선·0 이동·빠른 거품기 이동 검증 통과.
- iOS Device Hub / iPhone 17 Pro iOS 26.5에서 실제 드래그로 모든 재료 투입, 세 번 섞기, 도마 이동, 밀대, 버터 넣기, 성형, 오븐 투입 및 타이밍 꺼내기를 확인했다. 설명 모달의 **완성: 1/3**을 직접 확인했다.
- 마지막 시연 상태는 설명 모달에서 일시정지한 1/3 완성. 재접속 시 상태가 달라질 수 있다. 3개 완성 전체 네이티브 플레이는 아직 미검증이다.
- Android 번들 생성은 통과했으나 실제 Android 조작은 미검증. 확인 당시 ADB만 있고 연결 기기/에뮬레이터가 없었다.
- lint 설정/패키지가 없어 실행하지 않았다. `expo lint`가 설치를 유도하므로 승인 없이 실행하지 않는다. 새 의존성은 추가하지 않았다.
- `/tmp/check-baking-drag.cjs` 등 임시 검증 파일은 다른 환경에서 보존되지 않을 수 있다. 영구 테스트 프레임워크는 프로젝트 방침상 추가하지 않았다.

## 재실행

- 기본 `pnpm` shim이 깨져 있어 아래의 이미 설치된 pnpm으로 실행했다. 새 패키지 설치로 해결하지 않았다.

```sh
/Users/sopeuteuweeomaiseuteo/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm tsc --noEmit
/Users/sopeuteuweeomaiseuteo/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm expo start --dev-client --port 8082
```

- 시작 전 `lsof -iTCP:8082 -sTCP:LISTEN`으로 중복 서버를 확인한다. 확인 당시 8082 서버가 실행 중이었다. 8081은 다른 worktree 작업 서버였으므로 종료하지 않는다.
- Xcode의 시뮬레이터 UI는 `Device Hub` (`com.apple.dt.Devices`), 경로 `/Applications/Xcode.app/Contents/Applications/DeviceHub.app`이다. 기존 `Simulator.app` 경로만 찾고 없다고 판단하면 안 된다.
- CUA로 Device Hub를 열고 Expo 개발 메뉴 → Go home → **localhost:8082**를 선택한다. 앱이 8081에 연결돼 있을 수 있으므로 Connected to를 확인한다. 서버가 준비된 뒤 연결한다.
- 앱 ID `com.dasom.luvinapp`, scheme `luvinfrontendv2`, 플레이 경로 `/luvin-hell/bread-baking/play`. 라우트 변경은 딥링크에 영향을 주므로 신중히 한다.
- 재현: 시작 → 밀가루를 그릇으로 → 계란을 그릇으로 → 거품기를 그릇 안에서 움직인 뒤 놓기. 이후 버터·물, 소금·설탕·이스트도 같은 순서로 진행한다. 오븐은 네 번째 시각 박자에 트레이로 드래그한다.

- (2026-10-29, 박자/실패 피드백) `pnpm tsc --noEmit` 통과. Node(`--experimental-strip-types`)로 reducer를 직접 불러 박자 점등 경계(1~3박 ±75ms, 4박 ±250ms), 성공/일찍/늦게 결과, 유지 중 입력 무시, 3개 성공, 재시작 초기화 검증 통과.
- iOS 시뮬레이터: 실제 드래그로 오븐까지 진행 후 일찍 꺼내 `raw`(트레이 위 반죽 + 설명 모달의 밀가루 안내) 확인. 탄 빵(오븐 안), 4박 점등(4000ms), 박자 사이 소등(1500ms)은 초기 상태를 임시 고정해 렌더 확인 후 원복했다(시뮬레이터 도구 지연이 수 초~수 분이라 실시간 박자 캡처는 불가). 짧은 1~3박 번쩍임의 체감 구분은 사람이 직접 봐야 한다. Android 미확인.
- 관찰(기존 문제, 미수정): Ready/결과 오버레이 위로 스프라이트가 그려진다(스프라이트 `zIndex`). 패널 스크린샷은 옛 프레임일 수 있어 `xcrun simctl io booted screenshot` 으로 확인했다.
- 8082 Metro가 작업 중 종료돼 같은 명령으로 다시 띄웠다(아래 재실행 참고).

## 남은 작업 / 다음 에이전트

- **성형 단계 UI 개편 (논의 중, 미구현)**: 레퍼런스처럼 큰 도마 위에서 화살표 방향대로 문질러 성형하는 방식으로 바꾸기로 했다. 필요한 이미지와 미결 사항은 `docs/bread-baking-shaping-assets.md` 를 본다. 에셋을 받기 전에는 성형 화면 구현을 시작하지 않는다.
- **오븐 단계 타이머 개편 (2026-10-29 구현됨)**
  - 에셋: 사용자가 GPT로 만든 `timer-frame.png`·`timer-marker.png`(투명 배경)를 여백만 잘라 사용(원본은 `originals/`). 트랙 = 잘라낸 틀 기준 px 132–1873 × 141–257. 좌표는 `bakingLayout.slots.timerFrame/timerTrack/timerMarker`.
  - 규칙(`BAKING_RULES`, 초기값): `ovenGaugeMs` 4000, `ovenGreenWidth` 0.14, `ovenOrangeWidth` 0.1, `ovenGreenMinStart` 0.3, `tickMs` 50.
  - 순수 함수(`utils/game.ts`): `createOvenGreenStart(random)`, `getOvenProgress`, `getOvenGaugeZones`(빨강|주황|초록|주황|빨강), `judgeOvenPull`(초록=baked, 그 앞=raw, 그 뒤=burnt). `load` 액션이 `greenStart`를 싣고 온다(난수는 컴포넌트에서 `Math.random()`).
  - 화면(`baking-oven-scene.tsx`, 새 `baking-oven-gauge.tsx`): 굽는 동안 `litOven` + 빵 숨김 + 게이지 표시, 오븐 탭으로 꺼냄. 바늘이 끝에 닿으면 `burnt`. 결과 빵은 모두 트레이에 표시.
  - 문구: `bake` 안내와 `BAKING_HELP`의 박자 문장을 "타이머 바늘이 초록 칸에 왔을 때 오븐을 눌러…"로 바꿨다(박자 설명이 틀린 안내가 되어서). **사용자 확인 필요.**
  - 검증: 타입체크 통과, Node로 구간 합/판정/시간 초과 확인, iOS 시뮬레이터(D0BB5F22…, Metro 8082)에서 게이지·불 켜진 오븐·빵 숨김·탭 후 트레이에 탄 빵을 확인(임시로 시작 상태를 굽기로 고정했다가 원복). 실제 손으로 초록에 맞추는 체감, 성공(`baked`) 화면 캡처, Android는 **미확인**.
  - 첫 굽기 때 타이머 틀·바늘·불 켜진 오븐 이미지가 늦게 뜨던 문제: `load` 단계부터 미리 마운트해 두고 투명도만 바꾸게 고쳤다(녹화로 확인).
  - 시연 때 임시로 `start` 를 `load` 단계로 바꿨다가 `flour` 로 되돌렸다(2026-10-29).
  - 주의: 시뮬레이터가 3대 부팅돼 있다. `simctl ... booted`가 D0BB5F22를 가리키고, 27FD6EAF는 다른 작업(dino) 기기다.

- **성형 단계 개편 (2026-10-29 구현됨)**: 큰 도마(`large-board`) → 밀대로 펴기 → 버터 → 화살표 5번(상하좌우, 같은 방향 연속 없음, 40pt 미만 드래그는 무시) → 소금(`sprinkle` 단계 신설) → 오븐. 3번 틀리면 버튼 없는 `NoticeModal`("방향에 맞춰서 드래그해주세요!"), 떠 있는 동안 시간 정지, 아무 곳 탭 → 화살표만 새로 뽑아 재시작. 순수 함수 `utils/shaping.ts`, 화면 `baking-shaping-scene.tsx`·`baking-swipe-area.tsx`, 모달 `src/components/ui/notice-modal.tsx`. 반죽 이미지 6장은 같은 영역(1169×569)으로 잘라 한 슬롯(`boardDough`)에서 교체. 오븐 트레이 반죽·덜 익은 결과는 `shaping-roll-salted`. 새 문구(성형·소금 안내)는 사용자 확인 필요. iOS 화면 확인함(화살표 회전, 3번 틀림 → NOTICE 모달 → 탭하면 화살표 재시작). Android 미확인.
  - 수정한 오류: 화살표 회전을 `rotate-*` 클래스로 바꾸면 NativeWind 가 컴포넌트를 렌더 중에 교체해 "Couldn't find a navigation context" 오류가 났다. 회전은 `style` transform 으로 넣는다(같은 패턴 재발 주의).
- **반죽 순서 변경 (2026-10-29, 사용자 요청)**: 밀가루 → 계란 → 섞기 → **버터 → 물** → 섞기. 그릇은 단계마다 통째로 바뀌는 GPT 이미지(`flour-bowl`, `flour-egg-bowl`, `dough-butter-bowl`, `dough-butter-water-bowl`)를 쓴다. iOS 시뮬레이터에서 밀가루·계란·섞기·버터·물 순서로 그릇이 바뀌는 것을 확인했다. 물은 이미지 자체가 옅어서 눈에 잘 안 띈다.

- **미션 성공 쪽지 (2026-10-29)**: 소금빵 3개를 완성하면(`phase: 'success'`) 공용 `ResultOverlay` 대신 Figma `7962:6087` SUCCESS 쪽지("소금빵 만들기에 성공했어요")를 띄운다. `NoticeModal` 에 `title` prop 을 추가해 재사용. 화면 아무 곳 탭 → 닫히고 재시작(이전 오버레이와 같은 동작). 실패(`fail`)는 그대로 `ResultOverlay`. 쪽지는 기존 NOTICE 모달처럼 화면 세로 가운데에 뜬다(시안은 30pt 정도 위). iOS 확인, Android 미확인.

- **미션 보상 연동 (2026-10-30)**: 미션 성공/실패 시 `useReportMinigameResult(BAKING_MINIGAME_CODE, phase, 'code')` 로 `POST /api/minigames/{gameId}/play` 를 한 번 보낸다. 서버 code 는 **가정값 `salt_bread_baking`**(`utils/game.ts`). 2026-10-30 스테이징 `GET /api/minigames` 에는 `dinosaur_bread_game`·`bread_crossing_friends` 두 개뿐이라 지금은 조용히 건너뛴다(시뮬레이터 로그로 확인: lookup false, 요청 안 나감). 백엔드가 등록하면 code 만 맞추면 된다. **2026-10-30 갱신**: 백엔드 PR #96·#98(V17 마이그레이션 + 시드)로 `salt_bread_baking`(소금빵굽기, rewardToken 1) 등록, master 스테이징 배포 성공(run 40906560186). code 가 프론트 가정값과 같아 프론트 수정 없음. 2026-10-30 08:06 iOS 시뮬레이터(로그인 계정)에서 임시 시작 상태(마지막 빵 굽기, 넓은 초록 칸)로 성공시켜 확인: 서버 목록에서 code 로 찾음(gameId=3), `POST /play` 성공 → `reward.token=1` (Metro 로그). 이때 스테이징 계정에 토큰 1개 실제 지급됨. 임시 설정은 되돌렸고 tsc 통과. Android 미확인. 보상은 로컬 선지급 없이 서버 응답(`usePlayMinigame`)으로만 반영. 훅에 `matchBy`(title|code) 를 추가했고, 공룡빵·빵건너는 기존대로 title 매칭.
  - 주의(개발 중에만): 보고 훅 파일을 고치면 Fast Refresh 가 ref 를 초기화해, 성공 화면에 머물러 있던 다른 미니게임 화면이 결과를 다시 보낸다. 2026-10-30 00:10 에 이 때문에 `gameId=1`(공룡빵) 성공이 한 번 더 보고되어 스테이징 계정에 토큰 1개가 더 지급됐다.
  - 로그 위치: Metro 로그는 `.expo/dev/logs/start.log`(JSON 줄). 스크래치패드 `metro.log` 는 10-29 20:22 이후 갱신되지 않았다.

### 진행 중: 전체 빵굽기 에셋 배경 제거 (사용자 추가 요청)

- 대상 PNG 25개를 `src/assets/images/bread-baking/originals/`에 먼저 보존했다.
- 진행 상태와 원본 해시/크기는 `docs/bread-baking-background-removal.json`을 확인한다. 매 파일 저장 직후 갱신한다.
- built-in `image_gen`의 `transparent_background=true`로 개별 원본을 편집한다. 그림/문자/색/구도를 유지하고 배경만 제거한다. 결과를 검토하고 기존 캔버스 크기로 맞춰 같은 런타임 파일에 적용한다.
- 아직 전체 완료 아님. 다른 에이전트는 manifest의 pending 항목부터 이어받고, 이미 처리한 파일을 중복 생성하지 않는다. 기본 pnpm shim과 원래 작업의 변경사항은 건드리지 않는다.

1. **진입 경로 정정 필요**: 사용자는 “미니게임 탭에서 접근”이라고 명시했다. 현재 checkout의 BottomNav에는 home/oven/diary/bread만 있고 미니게임 탭은 찾지 못했다. 관련 브랜치/파일을 확인한 후 연결해야 한다. 기존 `/luvin-hell` 버튼을 최종 제품 진입이라고 단정하지 않는다.
2. 서버 게임 식별자 확인 후 토큰 보상/결과 보고 연동. 현재 보상 문구는 디자인대로 있으나 실제 서버 지급 연동은 없다. 임의 로컬 지급/서버 gameId 추측 금지.
3. Android 실제 드래그 및 양 플랫폼 작은 화면 확인. iOS 전체 3개 완성/실패 후 재시작 등도 추가 검증.
4. 에셋 일부의 사각 배경/겹침이 시연에서 보였다. 드래그 수정 범위에서는 에셋을 편집하지 않았다. Figma 원본과 비교 후 처리 방식을 결정해야 한다.
5. 단계 안내·완성 개수는 현재 설명 모달에서 볼 수 있다. 미세 UX/리듬 난이도는 추가 제품 조율 대상이다.

다음 작업 후 이 문서의 증거와 미완료 항목을 갱신한다. 계정 사용량 5% 이하가 확인되면 문서 갱신을 포함해 추가 작업하지 말고 즉시 중단한다.

## Ready/실패 덮개 겹침 수정 (2026-10-30)

- 문제: 재료 스프라이트(`baking-sprite.tsx`, zIndex 1/드래그 중 10)가 Ready 덮개 위로 올라와 "Ready?" 글자를 가렸다.
- 수정: `src/app/luvin-hell/bread-baking/play.tsx` 에서 `ReadyOverlay`·실패 `ResultOverlay` 를 `absolute inset-0 z-20` View 로 감쌌다. 공용 덮개 컴포넌트는 다른 미니게임도 쓰므로 건드리지 않았다.
- 확인: iOS 시뮬레이터에서 재료가 덮개 아래로 흐리게 깔리고, 탭하면 정상 시작. tsc 통과. 실패 덮개 화면·Android 는 직접 보지 않았다.

## 모드 선택 화면 Figma 5916:5300 반영 (2026-10-30)

- 버튼은 시안대로 두 개: "공룡빵게임", "다솜이의 소금빵게임"(→ 빵굽기). "빵건너친구들" 버튼은 사용자 결정으로 뺐다(게임 코드는 그대로).
- 버튼은 시안대로 항상 yellow/300(테두리 없음). 예전 "평소 흰색 + 누를 때만 노랑" 이탈을 사용자 결정으로 되돌렸다. `button.tsx` 의 `modeSelectPrimary`/`modeSelectSecondary` 를 `modeSelect` 하나로 합치고, 이 두 변형 전용이던 눌림 애니메이션(PressHighlightButton)을 지웠다.
- 확인: iOS 시뮬레이터에서 시안과 같은 화면, 소금빵게임 버튼 → 빵굽기 Ready 화면 이동. tsc 통과. Android 미확인.
- 남은 것(요청받지 않아 손대지 않음): 환영 투어 문구(`welcome/constants/tour.ts`)와 오븐 화면(`oven.tsx`)에는 아직 "빵건너친구들"이 나온다.
