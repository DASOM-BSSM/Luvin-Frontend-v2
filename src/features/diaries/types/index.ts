import type { BreadState, BreadType } from '@/src/assets/images/BreadCharacter';

/**
 * 감정일기 · 공유방 도메인 타입.
 *
 * 일기 · 공유방은 `docs/api/diaries.md`(백엔드 스펙 문서) 기준이고, 오늘의 밸런스 게임은
 * `docs/api/openapi.json` 기준이다. 일기 쪽이 openapi.json 에 들어오면 그쪽에 맞춰 다시 확인할 것.
 *
 * 이름 규칙: API 가 쓰는 "room" 을 데이터 계층(타입·API·훅)에서 그대로 쓰고, 화면 문구와 화면
 * 컴포넌트만 "그룹"이라고 부른다(감정일기 홈의 "그룹 만들기" / "그룹 참여하기").
 */

/** 일기 id. */
export type DiaryId = number;

/** 공유방 id. */
export type RoomId = number;

/** 사용자 id. */
export type UserId = number;

/** 일기 응답(DiaryResponse). 작성/상세/수정/공개범위 설정/내 일기 목록이 돌려준다. */
export interface Diary {
  diaryId: DiaryId;
  /** 일기는 항상 공유방 안에 쓴다. */
  roomId: RoomId;
  title: string;
  content: string;
  isMine: boolean;
  /** 한국 시간 ISO-8601. 예: "2026-10-01T07:56:53.770+09:00" */
  createdAt: string;
  updatedAt: string;
}

/** 목록 항목(FeedItem). 커뮤니티 · 공유방 일기 피드가 돌려준다. */
export interface DiaryFeedItem extends Diary {
  authorId: UserId;
  likeCount: number;
  commentCount: number;
  /** 내가 반응했는지. */
  liked: boolean;
  /** 작성자 닉네임(닉네임이 없으면 이름). 탈퇴한 사용자면 null. */
  authorNickname: string | null;
  /**
   * 작성자 빵 타입 id(설문 canonical, 예: "salt_bread"). 설문을 안 했거나 탈퇴한 사용자면 null.
   * 화면에서는 `toBreadType` 으로 바꿔 쓴다.
   */
  authorBreadType: string | null;
  /**
   * 내 반응 이모지. 없으면 null. 서버가 U+FE0F 를 빼고 저장해서 "❤" 처럼 올 수 있으니
   * 그릴 때는 `toDisplayEmoji` 를 거칠 것.
   */
  emoji: string | null;
}

/** `PUT /api/diaries/{diaryId}` 요청. */
export interface DiaryUpdateRequest {
  /** 1~100자 */
  title: string;
  /** 1~5000자 */
  content: string;
}

/** `POST /api/diaries` 요청. 방 멤버가 아니면 403, 없는 방이면 404. */
export interface DiaryCreateRequest extends DiaryUpdateRequest {
  roomId: RoomId;
}

/**
 * `POST /api/diaries/{diaryId}/like` 응답. 한 사람당 반응 1개 — 같은 이모지를 다시 누르면 취소
 * (`emoji: null`, `liked: false`), 다른 이모지를 누르면 그걸로 바뀐다.
 */
export interface DiaryReactionResult {
  diaryId: DiaryId;
  /** 지금 내 반응. 취소했으면 null. */
  emoji: string | null;
  liked: boolean;
  likeCount: number;
}

/** 공유방 응답(RoomResponse). */
export interface DiaryRoom {
  id: RoomId;
  name: string;
  ownerId: UserId;
}

/** `POST /api/diary-rooms`, `PUT /api/diary-rooms/{roomId}` 요청. */
export interface DiaryRoomWriteRequest {
  name: string;
  description?: string;
}

/** 멤버 목록 한 줄. `email` 은 개인정보 문제로 빠질 수 있다고 해서 선택값으로 둔다. */
export interface DiaryRoomMember {
  id: UserId;
  name: string;
  email?: string;
}

/** 멤버십 응답(MembershipResponse). 멤버 추가 · 나가기가 돌려준다. */
export interface DiaryRoomMembership {
  roomId: RoomId;
  userId: UserId;
  isMember: boolean;
  memberCount: number;
}

/** 멤버 강퇴 응답. */
export interface DiaryRoomKickResult {
  roomId: RoomId;
  userId: UserId;
  message: string;
}

/** openapi `DailyQuestionOptionResponse`. */
export interface DailyQuestionOption {
  optionId: number;
  content: string;
}

/** openapi `DailyQuestionOptionResultResponse`. 결과 화면 디자인이 아직 없어 화면에서 쓰지 않는다. */
export interface DailyQuestionOptionResult {
  optionId: number;
  content: string;
  voteCount: number;
  percentage: number;
}

/** openapi `DailyQuestionTodayResponse` — `GET /api/daily_questions/today`. */
export interface DailyQuestionToday {
  questionId: number;
  question: string;
  options: DailyQuestionOption[];
  /** 내가 이미 답했는지. */
  answered: boolean;
  /** 답했을 때 고른 보기. 안 답했으면 비어 있다. */
  selectedOptionId?: number | null;
  results?: DailyQuestionOptionResult[];
  /** 지금까지 답한 사람 수. "318명 응답중" */
  totalCount: number;
}

/** openapi `DailyQuestionAnswerRequest` — `POST /api/daily_questions/{questionId}/answer`. */
export interface DailyQuestionAnswerRequest {
  selectedOption: number;
}

/** 그룹 일기 카드에 그릴 작성자. */
export interface GroupDiaryAuthor {
  /** 설문을 안 했거나 탈퇴한 사용자면 null — 기본 빵 이미지 에셋이 오기 전까지는 그림을 비운다. */
  type: BreadType | null;
  state: BreadState;
  /** 작성자 닉네임. 예: "쫀쫀한 소금빵" */
  name: string;
}

/** 감정일기 홈 "쫀쫀한 조합들"의 그룹 일기 카드 한 장. */
export interface GroupDiaryPreview {
  author: GroupDiaryAuthor;
  /** 표시용 시각. 예: "15:00" */
  time: string;
  /** 줄바꿈(\n)으로 문단을 나눈다. */
  message: string;
}
