import type { DiaryId, RoomId } from '@/src/features/diaries/types';

/**
 * `diaries` 기능의 쿼리 키 팩토리(§11). 일기 · 공유방 · 커뮤니티 피드 키를
 * 여기 한 곳에서 관리한다 — 두 사람이 각자 키를 만들면 무효화(invalidate)가 어긋난다.
 *
 * 무효화할 때는 `all` / `lists()` 같은 상위 키를 넘기면 그 아래가 한 번에 무효화된다.
 */
export const diaryKeys = {
  all: ['diaries'] as const,
  lists: () => [...diaryKeys.all, 'list'] as const,
  /** 내 일기 목록(`GET /api/diaries?page=&size=`). */
  list: (page: number, size: number) => [...diaryKeys.lists(), { page, size }] as const,
  detail: (diaryId: DiaryId) => [...diaryKeys.all, 'detail', diaryId] as const,
  /** 일기 하나에 달린 댓글 목록. */
  comments: (diaryId: DiaryId) => [...diaryKeys.detail(diaryId), 'comments'] as const,
  /** 공유 일기(커뮤니티) 피드. */
  community: () => [...diaryKeys.all, 'community'] as const,
};

export const roomKeys = {
  all: ['diary-rooms'] as const,
  /** 내가 방장이거나 멤버인 공유방 목록. */
  list: () => [...roomKeys.all, 'list'] as const,
  /** 방 하나에 딸린 키 전체의 상위 키. 나가기 · 삭제할 때 이걸로 통째로 지운다. */
  detail: (roomId: RoomId) => [...roomKeys.all, 'detail', roomId] as const,
  /** 방 하나 정보(`GET /api/diary-rooms/{roomId}`). */
  room: (roomId: RoomId) => [...roomKeys.detail(roomId), 'room'] as const,
  members: (roomId: RoomId) => [...roomKeys.detail(roomId), 'members'] as const,
  /** 초대코드(방장 · 멤버만). */
  inviteCode: (roomId: RoomId) => [...roomKeys.detail(roomId), 'invite-code'] as const,
  /** 공유방 안의 일기 피드. */
  diaries: (roomId: RoomId) => [...roomKeys.detail(roomId), 'diaries'] as const,
  /** 그룹 질문 키 전체의 상위 키. */
  questions: (roomId: RoomId) => [...roomKeys.detail(roomId), 'questions'] as const,
  /** 지금 그룹 질문(`GET .../questions/current`). */
  currentQuestion: (roomId: RoomId) => [...roomKeys.questions(roomId), 'current'] as const,
  /** 지난 질문 목록(`GET .../questions`). */
  questionHistory: (roomId: RoomId) => [...roomKeys.questions(roomId), 'history'] as const,
};
