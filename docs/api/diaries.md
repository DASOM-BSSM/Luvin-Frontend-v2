# 감정일기 API 스펙 (일기 · 공유방)

> 백엔드에서 받은 스펙 문서 사본입니다. 백엔드 Swagger(`/swagger-ui`의 "감정일기" 태그)에도 같은 설명이 있습니다. `openapi.json`에 아직 들어오지 않은 API라 이 문서를 기준으로 프론트(`src/features/diaries/api/`)를 만들었습니다.
> `openapi.json`이 갱신되면 그쪽이 기준이 되고, 이 문서는 지워도 됩니다.
>
> 기준: 백엔드 `feat/#35` 브랜치 (PR #38). 구조 변경(공개범위 삭제 · 이모지 반응 · 커뮤니티 범위 변경) 반영본.

## 공통

### 인증
모든 API는 로그인 필요

```
Authorization: Bearer {accessToken}
```

### 응답 형식
```json
{ "success": true, "data": { ... }, "message": null }
```
- 실패 시: `{ "success": false, "data": null, "message": "에러 메시지" }`
- 시간 필드는 전부 한국 시간 ISO-8601: `"2026-10-01T07:59:13.224+09:00"`

### 일기와 공유방
일기는 **항상 공유방 안에** 씁니다. 공개범위(`visibility`)는 없어졌습니다.

### 공통 에러
| HTTP | 경우 |
|---|---|
| 400 | 입력값 오류 (빈 값, 길이 초과, 없는 enum 값, 잘못된 JSON) |
| 401 | 토큰 없음/만료 |
| 403 | 권한 없음 (`"권한이 없습니다."`) |
| 404 | 일기/공유방/사용자 없음 |

---

## 일기

### 1. 일기 작성
`POST /api/diaries`

**Request**
```json
{ "roomId": 1, "title": "오늘의 일기", "content": "내용" }
```
| 필드 | 타입 | 필수 | 조건 |
|---|---|---|---|
| roomId | number | ✅ | 방 멤버가 아니면 `403`, 없는 방 `404` |
| title | string | ✅ | 1~100자 |
| content | string | ✅ | 1~5000자 |

**Response** `200` → 일기 응답(DiaryResponse)

### 2. 내 일기 목록
`GET /api/diaries?page=0&size=20`

| 쿼리 | 기본값 | 설명 |
|---|---|---|
| page | 0 | 0부터 시작 |
| size | 20 | 최대 50 |

- **내가 쓴 일기만**, 최신순
- **Response** `200` → 일기 응답(DiaryResponse) 배열

### 3. 일기 상세
`GET /api/diaries/{diaryId}`

- 일기가 있는 방의 멤버가 아니면 `403`
- **Response** `200` → 일기 응답(DiaryResponse)

### 4. 일기 수정
`PUT /api/diaries/{diaryId}`

- 작성자만 (`403`)
- Request: `{ "title": "...", "content": "..." }` (방은 못 바꿈)
- **Response** `200` → 일기 응답(DiaryResponse)

### 5. 일기 삭제
`DELETE /api/diaries/{diaryId}`

- 작성자만 (`403`)
- 달린 반응·댓글도 같이 삭제됨
- **Response** `200`
```json
{ "success": true, "data": null, "message": "일기가 삭제되었습니다." }
```

### 6. 이모지 반응
`POST /api/diaries/{diaryId}/like`

**Request**
```json
{ "emoji": "❤️" }
```
- 이모지 문자 그대로 보냄 (디자인 이모지 + 키보드 이모지 아무거나)
- 이모지 **1개만** 가능, 2개 이상이나 글자는 `400`
- 한 사람당 반응 1개: **같은 이모지를 다시 누르면 취소**, 다른 이모지를 누르면 그걸로 바뀜
- **Response** `200`
```json
{ "success": true, "data": { "diaryId": 1, "emoji": "❤", "liked": true, "likeCount": 13 }, "message": null }
```
| 필드 | 설명 |
|---|---|
| emoji | 지금 내 반응, 취소했으면 `null` |
| liked | 내가 반응한 상태인지 |
| likeCount | 전체 반응 수 |

> ⚠️ `❤️`처럼 뒤에 보이지 않는 문자(U+FE0F)가 붙는 이모지는 저장할 때 그 문자를 빼서 `"❤"`로 옵니다. 그대로 그리면 흑백으로 보일 수 있어 앱에서 `\uFE0F`를 붙여 표시합니다(`utils/feed.ts`의 `toDisplayEmoji`).

### 7. 공유 일기 조회 (커뮤니티)
`GET /api/diaries/community`

- **내가 속한 모든 방의 일기**, 최신순, **최대 50개**
- 감정일기 홈 "쫀쫀한 조합들" 카드가 이걸 씀
- **Response** `200` → 목록 항목(FeedItem) 배열

---

## 공유방

> 공유방은 **초대 방식**입니다. 스스로 참여하는 API는 없고, 방장이 멤버를 추가합니다.

### 1. 공유방 생성
`POST /api/diary-rooms`

**Request**
```json
{ "name": "우리방", "description": "설명" }
```
| 필드 | 타입 | 필수 |
|---|---|---|
| name | string | ✅ |
| description | string | |

- 만든 사람이 방장이 되고, 자동으로 멤버로 등록됨
- **Response** `200` → 공유방 응답(RoomResponse)

### 2. 내 공유방 목록
`GET /api/diary-rooms`

- 내가 방장이거나 멤버인 방, **최근 참여한 방이 먼저**
- **Response** `200` → 공유방 응답(RoomResponse) 배열

### 3. 공유방 수정
`PUT /api/diary-rooms/{roomId}`

- 방장만 (`403`)
- Request는 공유방 생성과 같음
- **Response** `200` → 공유방 응답(RoomResponse)

### 4. 공유방 삭제
`DELETE /api/diary-rooms/{roomId}`

- 방장만 (`403`)
- 멤버는 모두 빠지고, **방의 일기도 같이 삭제됨**
- **Response** `200`
```json
{ "success": true, "data": null, "message": null }
```

### 5. 멤버 목록
`GET /api/diary-rooms/{roomId}/members`

- 방장·멤버만 (`403`)
- **Response** `200`
```json
{ "success": true, "data": [ { "id": 1, "name": "방장", "email": "owner@example.com" } ], "message": null }
```

### 6. 멤버 추가 (초대)
`POST /api/diary-rooms/{roomId}/members`

**Request**
```json
{ "userId": 2 }
```
- 방장만 (`403`), 없는 사용자 `404`
- 이미 멤버여도 `200`
- **Response** `200` → 멤버십 응답(MembershipResponse) (`isMember: true`)

### 7. 공유방 나가기
`DELETE /api/diary-rooms/{roomId}/members/me`

- **방장은 나갈 수 없음** → `400` `"방장은 공유방을 나갈 수 없습니다. 방을 없애려면 공유방을 삭제해주세요."`
- 이미 나간 상태여도 `200`
- **Response** `200` → 멤버십 응답(MembershipResponse) (`isMember: false`)

### 8. 멤버 강퇴
`DELETE /api/diary-rooms/{roomId}/members/kick?userId={userId}`

- 방장만 (`403`)
- 방장 자신은 강퇴 불가 → `400`
- 멤버가 아닌 id여도 `200`
- **Response** `200`
```json
{ "success": true, "data": { "roomId": 1, "userId": 2, "message": "공유방에서 나갔습니다." }, "message": null }
```

### 9. 공유방 일기 조회
`GET /api/diary-rooms/{roomId}/diaries`

- 방장·멤버만 (`403`)
- 이 방의 일기, 최신순
- **Response** `200` → 목록 항목(FeedItem) 배열

---

## 응답 객체

### 일기 응답 (DiaryResponse)
```json
{
  "diaryId": 1,
  "roomId": 1,
  "title": "오늘의 일기",
  "content": "내용",
  "isMine": true,
  "createdAt": "2026-10-01T07:56:53.770+09:00",
  "updatedAt": "2026-10-01T07:56:53.770+09:00"
}
```
| 필드 | 설명 |
|---|---|
| roomId | 일기가 있는 공유방 id (항상 있음) |
| isMine | 내가 쓴 일기인지 |

### 목록 항목 (FeedItem)
```json
{
  "diaryId": 2,
  "roomId": 1,
  "authorId": 3,
  "authorNickname": "쫀쫀한 소금빵",
  "authorBreadType": "salt_bread",
  "title": "방 일기",
  "content": "내용",
  "isMine": false,
  "likeCount": 2,
  "commentCount": 1,
  "liked": true,
  "emoji": "😳",
  "createdAt": "2026-10-01T07:56:53.770+09:00",
  "updatedAt": "2026-10-01T07:56:53.770+09:00"
}
```
| 필드 | 설명 |
|---|---|
| authorId | 작성자 id |
| authorNickname | 작성자 닉네임(없으면 이름). 탈퇴한 사용자면 `null` |
| authorBreadType | 빵 타입 id(설문 `bread_survey` 기준, 예: `salt_bread`). 설문 안 했거나 탈퇴했으면 `null` |
| likeCount / commentCount | 반응 수 / 댓글 수 |
| liked | 내가 반응했는지 |
| emoji | 내 반응 이모지, 없으면 `null` |

### 공유방 응답 (RoomResponse)
```json
{ "id": 1, "name": "우리방", "ownerId": 1 }
```

### 멤버십 응답 (MembershipResponse)
```json
{ "roomId": 1, "userId": 2, "isMember": true, "memberCount": 3 }
```

---

## 알려진 이슈 / 변경 예정
- 빵 타입이 `null`인 작성자용 기본 빵 이미지 필요 (디자인 에셋 대기)
- 멤버 목록의 `email`은 개인정보 이슈로 **빠질 수 있음**
- 강퇴에서 `userId`를 빼먹거나 숫자가 아니면 현재 `500` → `400`으로 수정 예정
- 없는 경로 요청 시 현재 `500` → `404`로 수정 예정
- 공유방은 초대 방식으로 확정 — 스스로 참여하는 API는 만들지 않음
