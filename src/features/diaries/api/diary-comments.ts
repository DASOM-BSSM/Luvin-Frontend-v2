import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type { DiaryComment, DiaryId } from '@/src/features/diaries/types';

/**
 * 댓글 API. `POST · GET /api/diaries/{diaryId}/comments`, `PUT · DELETE .../comments/{commentId}`.
 * 백엔드가 메신저로 알려준 스펙이라(docs/api/diaries.md "댓글") 다른 API 처럼 `ApiEnvelope` 로 감싸져
 * 온다고 본다 — 실제 응답이 다르면 여기만 고친다.
 */

/** `GET /api/diaries/{diaryId}/comments`. */
export async function getDiaryComments(diaryId: DiaryId): Promise<DiaryComment[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryComment[]>>(`/api/diaries/${diaryId}/comments`);
  return data.data;
}

export interface CreateCommentInput {
  diaryId: DiaryId;
  content: string;
}

/** `POST /api/diaries/{diaryId}/comments`. */
export async function createDiaryComment({ diaryId, content }: CreateCommentInput): Promise<DiaryComment> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryComment>>(`/api/diaries/${diaryId}/comments`, {
    content,
  });
  return data.data;
}

export interface UpdateCommentInput extends CreateCommentInput {
  commentId: number;
}

/** `PUT /api/diaries/{diaryId}/comments/{commentId}`. */
export async function updateDiaryComment({
  diaryId,
  commentId,
  content,
}: UpdateCommentInput): Promise<DiaryComment> {
  const { data } = await httpClient.put<ApiEnvelope<DiaryComment>>(
    `/api/diaries/${diaryId}/comments/${commentId}`,
    { content },
  );
  return data.data;
}

export interface DeleteCommentInput {
  diaryId: DiaryId;
  commentId: number;
}

/** `DELETE /api/diaries/{diaryId}/comments/{commentId}`. */
export async function deleteDiaryComment({ diaryId, commentId }: DeleteCommentInput): Promise<void> {
  await httpClient.delete(`/api/diaries/${diaryId}/comments/${commentId}`);
}
