import type { DiaryId, RoomId } from '@/src/features/diaries/types';

/**
 * `diaries` 기능의 쿼리 키 팩토리(§11). 일기 · 공유방 · 커뮤니티 피드 · 밸런스 게임 키를
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
  /** 공유 일기(커뮤니티) 피드. */
  community: () => [...diaryKeys.all, 'community'] as const,
};

export const roomKeys = {
  all: ['diary-rooms'] as const,
  /** 내가 방장이거나 멤버인 공유방 목록. */
  list: () => [...roomKeys.all, 'list'] as const,
  detail: (roomId: RoomId) => [...roomKeys.all, 'detail', roomId] as const,
  members: (roomId: RoomId) => [...roomKeys.detail(roomId), 'members'] as const,
  /** 공유방 안의 일기 피드. */
  diaries: (roomId: RoomId) => [...roomKeys.detail(roomId), 'diaries'] as const,
};

/** 오늘의 밸런스 게임(`/api/daily_questions`). */
export const dailyQuestionKeys = {
  today: ['daily-questions', 'today'] as const,
};
