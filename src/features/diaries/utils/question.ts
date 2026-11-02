import type { RoomId, RoomQuestion } from '@/src/features/diaries/types';

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

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 오늘 날짜 "YYYY-MM-DD" — 서버의 `questionDate`(KST)와 비교할 때 쓴다. */
export function getKstDateString(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * 오늘(KST) 질문인지. 질문은 그룹당 정각 칸마다 1개라, 칸이 같은지는 `slotStartAt` 으로 따로 본다
 * (utils/hour-slot.ts).
 */
export function isTodayQuestion(question: RoomQuestion, now: Date): boolean {
  return question.questionDate === getKstDateString(now);
}

/**
 * 서버 시각(한국 시간 ISO-8601)의 정각 칸 — "2026-11-02T15:37:..." → "2026-11-02T15". 날짜까지 넣어서
 * 어제 같은 시각과 섞이지 않게 한다. 서버가 이미 한국 시간으로 주므로 기기 시간대로 바꾸지 않는다.
 * 형식이 다르면 undefined.
 */
export function getHourSlotKey(isoDateTime: string): string | undefined {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2})/.exec(isoDateTime);
  return match ? `${match[1]}T${match[2]}` : undefined;
}

/** 서버 시각 → 정각 칸 "15:00". 형식이 다르면 빈 문자열. */
export function formatHourSlotLabel(isoDateTime: string): string {
  const match = /T(\d{2})/.exec(isoDateTime);
  return match ? `${match[1]}:00` : '';
}

/**
 * 홈에 질문 생성 알림을 띄울 질문인지 — 내용이 다 만들어진(ready) 오늘(KST) 질문만. 지난 날짜 질문은
 * 알림으로 띄우지 않는다(사용자 결정).
 */
export function isAnnounceableQuestion(question: RoomQuestion | null | undefined, now: Date): boolean {
  return question?.status === 'ready' && isTodayQuestion(question, now);
}

/**
 * 질문 생성 알림 아래에 보여줄 일기 — 그 그룹에서 질문과 같은 날 · 같은 정각 칸에 쓴 것만(사용자 결정:
 * 이전 시간 · 이전 날짜 일기는 같은 화면에 보이면 안 된다). 피드 순서(최신순)를 그대로 둔다.
 */
export function filterSameHourSlot<T extends { roomId: RoomId; createdAt: string }>(
  feed: T[],
  question: RoomQuestion,
): T[] {
  const slot = getHourSlotKey(question.slotStartAt);
  if (slot === undefined) return [];
  return feed.filter((item) => item.roomId === question.roomId && getHourSlotKey(item.createdAt) === slot);
}

/** 기기 시각의 한국 시간 정각 칸 — `getHourSlotKey` 와 같은 "2026-11-02T09" 꼴. */
export function getKstHourSlotKey(now: Date): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 13);
}

