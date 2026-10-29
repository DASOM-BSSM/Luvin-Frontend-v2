import type { RoomQuestion, RoomQuestionHistoryItem } from '@/src/features/diaries/types';

/** 그룹 질문 답 글자 수 한도(서버 규칙, 앞뒤 공백 제외). */
export const ANSWER_MAX_LENGTH = 200;

/** `generating` 동안 지금 질문을 다시 부르는 간격. 서버 안내는 1~3초. */
export const QUESTION_POLL_INTERVAL_MS = 2000;

/** 앞뒤 공백을 뺀 답이 1~200자인지 — 서버(400 `ROOM_ANSWER_INVALID`)와 같은 규칙. */
export function isValidAnswer(content: string): boolean {
  const { length } = content.trim();
  return length >= 1 && length <= ANSWER_MAX_LENGTH;
}

/** "2026-10-28" → "10월 28일". 형식이 다르면 받은 그대로 돌려준다. */
export function formatQuestionDate(questionDate: string): string {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(questionDate);
  if (!match) return questionDate;
  return `${Number(match[1])}월 ${Number(match[2])}일`;
}

/**
 * 지난 질문 목록에서 보여줄 것만 — 내용이 있는(ready) 질문 중 지금 질문을 뺀 것. 지금 질문은 위에
 * 따로 보이고, generating · failed 는 보여줄 내용이 없다.
 */
export function getPastQuestions(
  history: RoomQuestionHistoryItem[],
  current: RoomQuestion | null | undefined,
): RoomQuestionHistoryItem[] {
  return history.filter(
    (item) => item.status === 'ready' && item.content !== null && item.questionId !== current?.questionId,
  );
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 오늘 날짜 "YYYY-MM-DD" — 서버의 `questionDate`(KST)와 비교할 때 쓴다. */
export function getKstDateString(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * 오늘 질문이 이미 있는지. 지금 질문(가장 최근 날짜)이 어제 이전 것이면 오늘 질문은 아직 없어서
 * 다시 만들 수 있다 — 그룹당 하루(KST) 1개 규칙.
 */
export function isTodayQuestion(question: RoomQuestion, now: Date): boolean {
  return question.questionDate === getKstDateString(now);
}
