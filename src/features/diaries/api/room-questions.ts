import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type {
  RoomId,
  RoomQuestion,
  RoomQuestionHistoryItem,
  RoomQuestionId,
} from '@/src/features/diaries/types';

/**
 * 그룹 질문 API. 스펙: `docs/api/openapi.json` 의 `/api/diary-rooms/{roomId}/questions*`.
 * 전부 그룹 멤버만(403), 없는 그룹은 404.
 */

/** `GET .../questions/current` — 가장 최근 날짜의 질문. 질문이 한 번도 없으면 null. */
export async function getCurrentRoomQuestion(roomId: RoomId): Promise<RoomQuestion | null> {
  const { data } = await httpClient.get<ApiEnvelope<RoomQuestion | null>>(
    `/api/diary-rooms/${roomId}/questions/current`,
  );
  return data.data;
}

/**
 * `POST .../questions` — 202 와 함께 `generating` 질문이 바로 온다. 그룹당 하루(KST) 1개라 이미 있으면
 * 409 `ROOM_QUESTION_ALREADY_EXISTS` 이고, 그때 data 에 그 질문이 담겨 온다(`getExistingQuestion`).
 */
export async function createRoomQuestion(roomId: RoomId): Promise<RoomQuestion> {
  const { data } = await httpClient.post<ApiEnvelope<RoomQuestion>>(`/api/diary-rooms/${roomId}/questions`);
  return data.data;
}

/** `GET .../questions` — 지난 질문, 최신순. 답 내용 없이 답 수만 온다. */
export async function getRoomQuestionHistory(roomId: RoomId): Promise<RoomQuestionHistoryItem[]> {
  const { data } = await httpClient.get<ApiEnvelope<RoomQuestionHistoryItem[]>>(
    `/api/diary-rooms/${roomId}/questions`,
  );
  return data.data;
}

export interface AnswerQuestionInput {
  roomId: RoomId;
  questionId: RoomQuestionId;
  content: string;
}

/**
 * `POST .../questions/{questionId}/answers` — 한 사람당 1개, 다시 보내면 수정이다. 응답은 답이 반영된 질문.
 * 1~200자(앞뒤 공백 제외)가 아니면 400 `ROOM_ANSWER_INVALID`, 아직 ready 가 아니면 409 `ROOM_QUESTION_NOT_READY`.
 */
export async function answerRoomQuestion({ roomId, questionId, content }: AnswerQuestionInput): Promise<RoomQuestion> {
  const { data } = await httpClient.post<ApiEnvelope<RoomQuestion>>(
    `/api/diary-rooms/${roomId}/questions/${questionId}/answers`,
    { content },
  );
  return data.data;
}

export interface DeleteAnswerInput {
  roomId: RoomId;
  questionId: RoomQuestionId;
}

/** `DELETE .../questions/{questionId}/answers/me` — 내 답 삭제(없어도 200). 응답은 갱신된 질문. */
export async function deleteMyRoomAnswer({ roomId, questionId }: DeleteAnswerInput): Promise<RoomQuestion> {
  const { data } = await httpClient.delete<ApiEnvelope<RoomQuestion>>(
    `/api/diary-rooms/${roomId}/questions/${questionId}/answers/me`,
  );
  return data.data;
}
