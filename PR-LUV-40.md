## 📌 작업 내용

| 기능 | 상태 | 연동 API |
| -- | -- | -- |
| 러빈지옥 ep3 대화 연동 + 미니게임 결과 제출 | 코드 연결 완료, **기기 확인 아직 못 함** | `GET /api/ai/seasons/episodes/3`, `POST /api/ai/seasons/episodes/3/generations`, `POST /api/ai/seasons/episodes/3/selection` (모두 ep1과 같은 ai-season-controller 엔드포인트 재사용, 신규 없음) |

3개 파일 변경 / +50 / −20.

## 🌀 연관된 Jira 이슈

LUV-40

## 🔔 변경 사항

**대화 연동은 ep1과 같은 분기를 그대로 탐**

ep3는 매칭 없이 투표만 하는 구조(ep1과 동일)라, `map-ai-episode.ts`의 매핑 로직은 전혀 손대지 않았습니다. `useInfernoConversation`의 `AI_CONNECTED_EPISODES`에 3만 추가하면 기존 일반 분기(`chunkIntoPages` + `EPISODE_VOTE_PROMPTS[3]`, 이미 있던 값)가 그대로 동작합니다.

**미니게임 결과 제출 — 성공/실패 모두 `submitEpisode3Result`로 통일**

카드 뒤집기/야바위 미니게임 자체(셔플, 목숨, 승패 판정)는 순수 클라이언트 로직이라 이번에 손대지 않았습니다. 게임이 끝난 뒤 결과만 서버로 보냅니다:
- 성공 → 투표 화면에서 상대를 고르면 `submitEpisode3Result(true, selectedId)`
- 실패 → 기존엔 아무 API도 안 탔는데, 실패 쪽지 문구("랜덤으로 상대가 정해져요ㅠㅠ")를 보면 서버가 실패도 알아야 랜덤 매칭을 할 수 있다고 판단해서 `submitEpisode3Result(false)`를 추가로 호출하도록 흐름 훅에 `handleGameFailure`를 새로 만들었습니다.

**로딩/에러 화면 — ep1·ep2와 동일 패턴**

`conversation`/`conversation.vote`가 아직 없으면 `return null` 대신 "AI가 대화를 만들고 있어요..." / "대화를 불러오지 못했어요" 안내를 보여주도록 바꿨습니다.

## ⚠️ 리뷰 전 확인 부탁

**1. 미니게임 승패 판정이 100% 클라이언트 로직입니다**

카드 뒤집기/야바위 모두 정답(target)과 승패 판정을 클라이언트가 직접 들고 있다가 계산합니다 — 서버는 과정을 전혀 모르고, 끝난 뒤 결과(`success: boolean`)만 클라이언트가 보고합니다. 지금 구조상 클라이언트가 임의로 `success: true`를 보내는 것도 막을 방법이 없는데, 이 정도 신뢰 수준이 기획 의도에 맞는지 확인 부탁드립니다. (부정행위 방지가 필요하면 서버가 판정하는 구조로 바꿔야 합니다.)

**2. 실패 시 `submitEpisode3Result(false)` 호출이 맞는 동작인지 확인 필요**

"실패하면 랜덤으로 상대가 정해진다"는 문구에 근거한 추론이라, 이 엔드포인트가 실제로 그 랜덤 매칭을 트리거하는 게 맞는지 백엔드 확인이 필요합니다.

**3. 이 화면 자체를 아직 기기에서 못 열어봤습니다**

ep1·ep2와 같은 이유로 시즌 생성 트리거(`POST /api/ai/seasons`)가 아직 없어 ep3까지 도달해서 확인할 방법이 없습니다.

## 확인한 것 / 못한 것 ⚠️

- **기기 확인 못 했습니다.** `pnpm tsc --noEmit` 통과만 확인했습니다.
- 카드 뒤집기/야바위 게임 자체는 이번 PR에서 안 건드린 기존 코드라 별도 확인 대상 아닙니다.
- iOS는 확인 안 했습니다.
- 자동화 테스트는 프로젝트 방침상 없습니다(§6).

## 알려진 제약

- ep4("다시 굽기" 포함) API 연동은 이번 PR 범위 밖입니다.
- 미니게임 승패는 클라이언트 판정 그대로입니다(위 리뷰 확인 사항 1 참고) — 서버 검증이 필요해지면 별도 작업입니다.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
