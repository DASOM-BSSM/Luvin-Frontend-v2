# 공룡빵게임 배경 스크롤 · 안 보이는 빵 — 인계 (2026-10-29)

브랜치: `feat/LUV-89` (origin/dev 기준, 워크트리 `../luvin-frontend-v2-luv89`). 원래 `feat/LUV-88` 체크아웃에서 작업한 뒤 이 변경만 옮겨 커밋했다 — LUV-88 체크아웃에도 같은 내용이 미커밋으로 남아 있다.

## 바뀐 파일
- `src/features/luvin-hell/games/dino-runner/components/DinoClouds.tsx` (새 파일) — 구름 3개 한 벌을 두 벌 이어 붙여 `distance * CLOUD_PARALLAX_RATIO` 만큼 왼쪽으로 흘린다.
- `components/DinoGround.tsx` — 선택 prop `distance`. 주면 흙바닥 패치가 장애물과 같은 속도(1배)로 흐른다. `about.tsx` 는 prop 없이 그대로 멈춘 그림.
- `components/DinoRunnerScene.tsx` — 정적 구름 대신 `DinoClouds`, `DinoGround` 에 `engine.distance` 전달.
- `hooks/useDinoEngine.ts` — `distance` shared value 를 반환값에 추가(로직 변경 없음).
- `engine/constants.ts` — `CLOUD_PARALLAX_RATIO`(0.15), `GROUND_TILE_WIDTH`(344).

## 검증
- `tsc --noEmit` 통과.
- iOS 시뮬레이터(iPhone 17 Pro 26.5)에서 녹화 → 프레임 추출로 구름이 느리게, 흙바닥 패치가 반죽과 같은 속도로 끊김 없이 흐르는 것 확인. Ready/Game Over 에선 멈춘다.
- Android 미확인(이 맥에 Android 환경 없음).

## 반죽이 땅 속에 박히는 문제 — 수정함
- 사용자 지적: "빵이 땅 안에 박혀 있음". 26.5 시뮬레이터 녹화에서 프레첼이 잔디 아래 흙 속(약 40pt 아래)에 그려진 판을 확인했다.
  가끔만 생긴다(다른 판은 정상). 5a3c314 가 `collapsable={false}` 로 막으려던 것과 같은 증상 — 반죽 이미지 크기를 `h-full w-full`
  (부모 비율)로 줘서, 부모가 박스가 아니라 다른 뷰로 잡히면 위치·크기가 어긋난다.
- 수정: `BreadCharacter` 에 선택 `style` prop 추가(주면 className 대신 씀). `ObstacleSlotView` 는 반죽 크기를 고정 px
  (`OBSTACLE_WIDTH` x 각 높이)로 주고, 크기 0 이던 바깥 래퍼에 실제 크기(`OBSTACLE_WIDTH` x `FRAME_HEIGHT`)·`collapsable={false}`·
  `pointerEvents="none"` 을 줬다.
- 검증: 충돌을 임시로 끈 판을 26.5·27.0 시뮬레이터에서 동시에 약 35초씩 녹화(0.5초 간격 64프레임씩). 슬롯이 다 돌 만큼 장애물이 지나갔고
  땅 위 반죽은 전부 잔디 윗면에 놓였다. 공중 반죽도 정상. 원래 버그가 가끔 생기는 거라 "다시는 안 생긴다"를 증명한 건 아니다.

## 빵이 안 보이는 문제 — 재현 안 됨
- iOS 시뮬레이터에서 일반 판 + 충돌을 임시로 끈 판(기록 78까지)을 녹화했는데 지상·공중 반죽이 모두 보였다. 디버그 수정은 되돌렸다.
- 덤으로 알게 된 것: 장애물이 한 번에 하나뿐인 초반엔 늘 슬롯 0 이 재사용돼서 같은 반죽만 나온다(슬롯마다 종류가 고정이라).
- 사용자 답: "iOS 27". iOS 27.0 시뮬레이터(iPhone 17 Pro, D0BB5F22…)에 10/26 Xcode 27.1 빌드
  (`DerivedData/luvinfrontendv2-dumhvbsubvqhzddzolkhnkahkond`)를 설치해 다시 녹화 — 일반 판, 충돌 끈 판(기록 74, 공중 반죽 포함)
  모두 반죽이 다 보였다. 맥에 연결된 실기기는 없었다. 실기기 여부·빌드 종류·스크린샷을 사용자에게 받아야 한다.
- 디스크 여유가 300MB~1.3GB 뿐이다(Metro 캐시 쓰기가 ENOSPC 로 실패). 네이티브 빌드 전에 공간 확보 필요.
