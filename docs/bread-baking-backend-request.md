# 백엔드 요청: 빵굽기 미니게임 등록 (LUV-88, 2026-10-30)

백엔드(`DASOM-BSSM/Luvin-Backend-v2`)에 전달할 프롬프트. 프론트는 code `salt_bread_baking` 으로 이미 연동해 두었고, 서버 목록에 없으면 보고를 건너뛴다.

```
Luvin-Backend-v2 에 새 미니게임 "빵굽기(소금빵)" 를 등록해줘. 프론트(luvin-frontend-v2)는 이미 이 게임의 결과 보고를 구현해 두었고, 서버 목록에서 code 로 게임을 찾는다.

## 등록할 값
- code: salt_bread_baking   ← 프론트가 이 값으로 찾으므로 정확히 이 문자열로
- title: 소금빵굽기
- description: 소금빵 3개를 만들어 파는 미니게임
- thumbnailUrl: null (기존 두 게임과 동일)
- rewardToken: 1

## 해야 할 일
1. SeedDataLoader.seedMinigames() 에 위 게임을 추가해줘(기존 공룡빵게임·빵건너친구들과 같은 방식).
2. seedMinigames() 는 minigames 테이블이 비어 있을 때만 돌아서, 이미 데이터가 있는 스테이징/운영에는 들어가지 않아.
   V4__minigames_code_column.sql 과 같은 패턴으로 Flyway 마이그레이션(다음 버전 번호)을 추가해서,
   minigames 테이블이 존재하고 code = 'salt_bread_baking' 행이 없을 때만 INSERT 하게 해줘.
   빈 DB(CI)에서는 테이블이 아직 없으니 no-op 이어야 하고, 재실행해도 중복으로 들어가면 안 돼.
   시드와 마이그레이션의 code/title/description/rewardToken 값은 반드시 같게 맞춰줘.
3. API 스펙은 바꾸지 마. 기존 엔드포인트를 그대로 쓴다:
   - GET  /api/minigames                → games[] 에 { gameId, code: "salt_bread_baking", title, rewardToken: 1 } 이 보여야 함
   - POST /api/minigames/{gameId}/play  → body { "success": "성공" } 이면 reward.token = 1 지급, { "success": "실패" } 이면 지급 없음
     (기존 두 게임과 같은 규칙)

## 확인
- 스테이징에 배포 후 GET /api/minigames 응답에 salt_bread_baking 이 있는지
- 그 gameId 로 POST /play "성공" 시 토큰 잔액(GET /api/tokens/me)이 1 오르는지
- 배포가 끝나면 새 게임의 gameId 와 code 를 프론트에 알려줘
```
