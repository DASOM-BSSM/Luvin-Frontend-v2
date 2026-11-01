import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type { BalanceGame, BalanceGameQuestionId } from '@/src/features/diaries/types';

/** 밸런스 게임 API. 스펙: `docs/api/openapi.json` 의 `/api/daily_questions/*`. */

/** `GET /api/daily_questions/today` — 오늘의 밸런스 게임. 오늘 질문이 없으면 null(섹션을 숨긴다). */
export async function getTodayBalanceGame(): Promise<BalanceGame | null> {
  const { data } = await httpClient.get<ApiEnvelope<BalanceGame | null>>('/api/daily_questions/today');
  return data.data;
}

export interface AnswerBalanceGameInput {
  questionId: BalanceGameQuestionId;
  optionId: number;
}

/**
 * `POST /api/daily_questions/{questionId}/answer` — 보기 하나를 고른다. 한 번뿐이고 바꿀 수 없다.
 * 응답은 결과가 채워진 질문(GET today 와 같은 모양). 이미 골랐으면 409 `DAILY_QUESTION_ALREADY_ANSWERED`.
 */
export async function answerBalanceGame({ questionId, optionId }: AnswerBalanceGameInput): Promise<BalanceGame> {
  const { data } = await httpClient.post<ApiEnvelope<BalanceGame>>(`/api/daily_questions/${questionId}/answer`, {
    selectedOption: optionId,
  });
  return data.data;
}
