import httpClient from '@/src/lib/http-client';

import type {
  DailyQuestionAnswerRequest,
  DailyQuestionToday,
} from '@/src/features/diaries/types';

/** `GET /api/daily_questions/today` — 오늘의 밸런스 게임. */
export async function getTodayQuestion(): Promise<DailyQuestionToday> {
  const { data } = await httpClient.get<DailyQuestionToday>('/api/daily_questions/today');
  return data;
}

export interface AnswerDailyQuestionInput {
  questionId: number;
  optionId: number;
}

/** `POST /api/daily_questions/{questionId}/answer` — 보기 하나를 고른다. */
export async function answerDailyQuestion({
  questionId,
  optionId,
}: AnswerDailyQuestionInput): Promise<void> {
  const body: DailyQuestionAnswerRequest = { selectedOption: optionId };
  await httpClient.post(`/api/daily_questions/${questionId}/answer`, body);
}
