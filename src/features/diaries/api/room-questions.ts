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

/** `GET .../questions/current` — 가장 최근 칸(`slotStartAt`)의 질문. 질문이 한 번도 없으면 null. */
export async function getCurrentRoomQuestion(roomId: RoomId): Promise<RoomQuestion | null> {
  const { data } = await httpClient.get<ApiEnvelope<RoomQuestion | null>>(
    `/api/diary-rooms/${roomId}/questions/current`,
  );
  return data.data;
}

/**
 * `POST .../questions` — 202 와 함께 `generating` 질문이 바로 온다. 그룹당 KST 정각 칸(예: 09:00~09:59)마다
 * 1개라 이 칸에 이미 있으면 409 `ROOM_QUESTION_ALREADY_EXISTS` 이고, 그때 data 에 그 질문이 담겨 온다
 * (`getExistingQuestion`). 칸은 요청한 시각으로 서버가 정한다.
 */
export async function createRoomQuestion(roomId: RoomId): Promise<RoomQuestion> {
  const { data } = await httpClient.post<ApiEnvelope<RoomQuestion>>(`/api/diary-rooms/${roomId}/questions`);
  return data.data;
}

/** 지난 질문 한 번에 받는 수 — 서버 최대값. 질문이 칸마다 생겨서 기본값(20)이면 하루치도 못 담는다. */
const QUESTION_HISTORY_PAGE_SIZE = 50;

/**
 * `GET .../questions` — 지난 질문, 최신순(`slotStartAt`). 답 내용 없이 답 수만 온다(답은
 * `getRoomQuestion`). 첫 페이지 50개만 받는다. `date`(KST "YYYY-MM-DD")를 주면 그날 칸만 받는다
 * (서버 `from` · `to`, 하루 최대 24개) — 달력에서 고른 날을 볼 때 쓴다.
 */
export async function getRoomQuestionHistory(
  roomId: RoomId,
  date?: string,
): Promise<RoomQuestionHistoryItem[]> {
  const { data } = await httpClient.get<ApiEnvelope<RoomQuestionHistoryItem[]>>(
    `/api/diary-rooms/${roomId}/questions`,
    { params: { size: QUESTION_HISTORY_PAGE_SIZE, ...(date ? { from: date, to: date } : {}) } },
  );
  return data.data;
}

/**
 * `GET .../questions/{questionId}` — 질문 하나(지난 질문 포함). 형태는 current 와 같고, `content` · `myAnswer` ·
 * `answers` 는 `ready` 일 때만 채워진다. 이 그룹의 질문이 아니면 404 `ROOM_QUESTION_NOT_FOUND`.
 */
export async function getRoomQuestion(roomId: RoomId, questionId: RoomQuestionId): Promise<RoomQuestion> {
  const { data } = await httpClient.get<ApiEnvelope<RoomQuestion>>(
    `/api/diary-rooms/${roomId}/questions/${questionId}`,
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
