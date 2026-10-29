import type { BreadState, BreadType } from '@/src/assets/images/BreadCharacter';

/**
 * 감정일기 · 공유방 도메인 타입.
 *
 * 일기는 `docs/api/diaries.md`(백엔드 스펙 문서) 기준이고, 공유방은 `docs/api/openapi.json` 기준이다.
 * 일기 쪽도 openapi.json 에 들어와 있으니 손댈 때 그쪽에 맞춰 다시 확인할 것.
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

/** 공유방 응답(openapi `DiaryRoomResponse`). 목록 · 단건 조회 · 생성 · 수정이 같이 쓴다. */
export interface DiaryRoom {
  id: RoomId;
  name: string;
  description?: string | null;
  ownerId: UserId;
  /** 최대 인원(방장 포함). 2~6. */
  maxMemberCount: number;
  /** 지금 인원(방장 포함). */
  memberCount: number;
}

/**
 * `POST /api/diary-rooms`(`DiaryRoomCreateRequest`), `PUT /api/diary-rooms/{roomId}`
 * (`DiaryRoomUpdateRequest`) 요청. PUT 도 모든 필드를 다시 보낸다.
 */
export interface DiaryRoomWriteRequest {
  name: string;
  description?: string;
  /** 최대 인원(방장 포함). 2~6, 범위 밖이면 400. */
  maxMemberCount: number;
  /** 이 방에서 쓸 방장 닉네임. 1~10자. */
  ownerNickname: string;
}

/** 멤버 목록 한 줄(openapi `DiaryRoomMemberResponse`). `email` 은 개인정보 문제로 빠질 수 있다고 해서 선택값으로 둔다. */
export interface DiaryRoomMember {
  id: UserId;
  name: string;
  email?: string;
  /** 이 방에서 쓰는 닉네임. */
  nickname?: string | null;
  role?: 'OWNER' | 'MEMBER';
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

/** `GET · POST /api/diary-rooms/{roomId}/invite-code` 응답. 8자리 영구 코드(재발급하면 이전 코드는 못 쓴다). */
export interface DiaryRoomInviteCode {
  roomId: RoomId;
  /** 예: "K7Q2M9XA". 대소문자를 가리지 않는다. */
  inviteCode: string;
}

/** `POST /api/diary-rooms/join` 요청(`DiaryRoomJoinRequest`). 응답은 `DiaryRoomMembership`. */
export interface JoinRoomRequest {
  inviteCode: string;
  /** 이 방에서 쓸 닉네임. 1~10자. 이미 멤버면 무시된다. */
  nickname: string;
}

/** 댓글. `GET /api/diaries/{diaryId}/comments` 목록의 한 줄, 작성 · 수정 응답. */
export interface DiaryComment {
  id: number;
  userId: UserId;
  content: string;
  /** 한국 시간 ISO-8601. */
  createdAt: string;
  updatedAt: string;
}

/** 댓글 작성 · 수정 요청. */
export interface DiaryCommentWriteRequest {
  content: string;
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
  /** 내가 남긴 반응 이모지(그릴 수 있게 다듬은 값). 없으면 null — 카드에 반응 남기기 아이콘이 보인다. */
  myEmoji: string | null;
}

/** 그룹 질문 id. */
export type RoomQuestionId = number;

/**
 * 그룹 질문 상태. 만들기를 누르면 `generating` 으로 바로 오고 1~3초 뒤 `ready` 가 된다.
 * `failed` 면 다시 만들기(POST)를 누를 수 있다.
 */
export type RoomQuestionStatus = 'generating' | 'ready' | 'failed';

/**
 * 그룹 질문의 답 한 개(openapi `RoomQuestionAnswerItem`). `authorNickname` 은 계정 닉네임이다 —
 * 그룹 닉네임(멤버 목록)으로 바꿔 끼우지 않는다(백엔드 확인).
 */
export interface RoomQuestionAnswer {
  answerId: number;
  authorId: UserId;
  authorNickname: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** 그룹 질문(openapi `RoomQuestionView`). `content` · `myAnswer` · `answers` 는 `ready` 일 때만 채워진다. */
export interface RoomQuestion {
  questionId: RoomQuestionId;
  roomId: RoomId;
  /** 질문 날짜(KST, "2026-10-28"). 그룹당 하루 1개. */
  questionDate: string;
  content: string | null;
  status: RoomQuestionStatus;
  createdAt: string;
  /** 내 답. 없으면 null. */
  myAnswer: RoomQuestionAnswer | null;
  /** 멤버들의 답(내 답 포함), 작성순. */
  answers: RoomQuestionAnswer[] | null;
}

/** 지난 질문 목록 한 줄(openapi `RoomQuestionHistoryItem`). 답 내용은 없고 답 수만 온다. */
export interface RoomQuestionHistoryItem {
  questionId: RoomQuestionId;
  questionDate: string;
  content: string | null;
  status: RoomQuestionStatus;
  createdAt: string;
  answerCount: number;
}
