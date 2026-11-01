# LUV-90 감정일기 피드백 반영 — 핸드오프

- 워크트리: `../luvin-frontend-v2-luv90`, 브랜치 `feat/LUV-90` (origin/dev 1794484 에서 땀, 아직 커밋 없음)
- `node_modules` 는 원래 체크아웃 것을 심링크 — 이 폴더에서 `pnpm` 명령을 돌리지 말 것. 타입체크는 `./node_modules/.bin/tsc --noEmit`

## 받은 피드백과 반영

| # | 피드백 | 반영 |
| - | ------ | ---- |
| 1 | 답하기 버튼 없애기 | `question-prompt.tsx` — "답하기 / 내 답 보기" 버튼 삭제. 질문 문장·답 수 전체를 누르면 답 모달 |
| 2 | "답 N개" 가운데 정렬 | 같은 파일 — 답 수를 가운데로 |
| 3 | 내가 쓰면 "눌러서 작성" 카드가 없어져야 함 | `group-diary-list.tsx` — 1시간 쿨다운 중엔 숨기고, 끝나는 순간 타이머로 다시 보여줌 |
| 4 | 목록 카드의 반응(☺+) 버튼을 눌러도 이모지가 안 뜸 | 원인: 목록에선 `onReactionPress` 없이 그려져 터치만 먹었다. `DiaryItem` 에 이모지 고르기 + `useReactToDiary` 연결 |
| 5 | 칸 막대: 첫 질문이면 첫 칸 | `getQuestionProgressIndex`(utils/question.ts) — 질문 날짜 수 기준 (n-1)%7. 메인 화면이 질문 이력을 항상 불러온다. 안 쓰게 된 `getWeekdayIndex` 삭제 |
| 6 | 감정일기 홈 카드 반응 버튼도 똑같이 | 공용 `reactable-diary-card.tsx`(이모지 고르기 + `useReactToDiary`)로 분리해 홈(`group-feed-section.tsx`) · 메인 목록이 같이 씀 |
| 7 | 앱 홈 화면의 감정일기 칸도 작동하게 | `src/app/index.tsx` — 가짜 `DIARY_PREVIEW`(항상 null) 대신 감정일기 탭의 `GroupFeedSection` 을 그대로 씀. 그룹 없으면 "Emodi 감정일기" + 시작하기(→ `/diaries`), 있으면 "쫀쫀한 조합들" + 최신 일기 카드(반응 가능) + "감정일기 바로가기→"(→ 그 그룹 메인). 문구용 `shortcutLabel` prop 추가. 안 쓰게 된 `home/components/diary-preview-card.tsx` · `create-question-card.tsx` · `home/types` 의 `DiaryPreview` 는 지우지 않고 남겨 둠 |

## 검증

- `tsc --noEmit` 통과
- iOS 시뮬레이터(iPhone 17 Pro 26.5, 스테이징 "Test" 그룹): 칸 막대가 2번째 칸(지난 질문 2개), 목록 카드 반응 버튼 → 이모지 고르기 → 반응 변경 확인(테스트 후 원래 😍 로 되돌림)
- 홈 카드 반응 버튼 → 이모지 고르기 펼쳐짐 확인(고르지 않고 닫음)
- 앱 홈: "쫀쫀한 조합들" + 실제 최신 일기 카드 표시, "감정일기 바로가기→" → Test 그룹 메인 이동 확인. 그룹 없는 계정의 시작하기 카드는 못 봄
- 사용자 직접 확인(2026-11-01, iOS): 3 · 4 · 5 · 6 · 7 완료. 1 · 2 는 Claude 가 시뮬레이터에서 확인(버튼 없음 · "답 1개" 가운데 · 누르면 답 모달 열림)
- 미확인: 1·2번(오늘 질문이 없는 그룹이라 "Q." 화면을 못 봄), 3번(일기를 새로 써야 해서 안 씀), Android 전체

## 남은 것

- 피드백 추가분이 더 올 수 있음
- 커밋/PR 은 사용자 확인 후
