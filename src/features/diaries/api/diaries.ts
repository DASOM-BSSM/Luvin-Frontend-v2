import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type {
  Diary,
  DiaryCalendarDay,
  DiaryFeedItem,
  DiaryId,
  DiaryCreateRequest,
  DiaryReactionResult,
  DiaryRecentReaction,
  DiaryUpdateRequest,
} from '@/src/features/diaries/types';

/** 일기 API. 스펙: `docs/api/diaries.md` "일기". 응답은 전부 `ApiEnvelope` 로 감싸져 온다. */

/** `POST /api/diaries`. 일기는 항상 방 안에 쓴다(방 멤버가 아니면 403). */
export async function createDiary(input: DiaryCreateRequest): Promise<Diary> {
  const { data } = await httpClient.post<ApiEnvelope<Diary>>('/api/diaries', input);
  return data.data;
}

export interface MyDiariesParams {
  /** 0부터 시작. */
  page: number;
  /** 최대 50. */
  size: number;
}

/** `GET /api/diaries?page=&size=` — 내가 쓴 일기만, 최신순. */
export async function getMyDiaries({ page, size }: MyDiariesParams): Promise<Diary[]> {
  const { data } = await httpClient.get<ApiEnvelope<Diary[]>>('/api/diaries', {
    params: { page, size },
  });
  return data.data;
}

/** `GET /api/diaries/calendar?year=&month=` — 그달(한국 시간) 내가 일기를 쓴 날, 날짜 오름차순. month 는 1~12. */
export async function getMyDiaryCalendar(year: number, month: number): Promise<DiaryCalendarDay[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryCalendarDay[]>>('/api/diaries/calendar', {
    params: { year, month },
  });
  return data.data;
}

/** `GET /api/diaries/{diaryId}`. 공개범위상 볼 수 없으면 403. */
export async function getDiary(diaryId: DiaryId): Promise<Diary> {
  const { data } = await httpClient.get<ApiEnvelope<Diary>>(`/api/diaries/${diaryId}`);
  return data.data;
}

export interface UpdateDiaryInput extends DiaryUpdateRequest {
  diaryId: DiaryId;
}

/** `PUT /api/diaries/{diaryId}`. 작성자만(403). */
export async function updateDiary({ diaryId, ...body }: UpdateDiaryInput): Promise<Diary> {
  const { data } = await httpClient.put<ApiEnvelope<Diary>>(`/api/diaries/${diaryId}`, body);
  return data.data;
}

/** `DELETE /api/diaries/{diaryId}`. 작성자만(403). 달린 공감 · 댓글도 같이 지워진다. */
export async function deleteDiary(diaryId: DiaryId): Promise<void> {
  await httpClient.delete(`/api/diaries/${diaryId}`);
}

export interface ReactToDiaryInput {
  diaryId: DiaryId;
  /** 이모지 한 개 그대로(예: "😳"). 2개 이상이거나 글자면 400. */
  emoji: string;
}

/**
 * `POST /api/diaries/{diaryId}/like` — 이모지 반응. 한 사람당 1개라 같은 이모지를 다시 보내면
 * 취소되고, 다른 이모지를 보내면 그걸로 바뀐다.
 */
export async function reactToDiary({ diaryId, emoji }: ReactToDiaryInput): Promise<DiaryReactionResult> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryReactionResult>>(
    `/api/diaries/${diaryId}/like`,
    { emoji },
  );
  return data.data;
}

/**
 * `GET /api/diaries/reactions/recent?limit=1` — 내 그룹들의 일기에 다른 사람이 남긴 가장 최근 반응(내 반응은 빠진다).
 * 없으면 빈 배열. `after`(본 알림 다시 안 받기)는 쓰지 않는다 — 홈에 늘 가장 최근 반응 하나를 보여준다.
 */
export async function getRecentReactions(): Promise<DiaryRecentReaction[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryRecentReaction[]>>('/api/diaries/reactions/recent', {
    params: { limit: 1 },
  });
  return data.data;
}

/** `GET /api/diaries/community` — 내가 속한 모든 방의 일기, 최신순, 최대 50개. */
export async function getCommunityDiaries(): Promise<DiaryFeedItem[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryFeedItem[]>>('/api/diaries/community');
  return data.data;
}
