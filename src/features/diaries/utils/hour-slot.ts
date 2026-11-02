import type { RoomQuestion, RoomQuestionHistoryItem } from '@/src/features/diaries/types';
import {
  getHourSlotKey,
  getKstHourSlotKey,
  isTodayQuestion,
} from '@/src/features/diaries/utils/question';

/**
 * 감정일기 메인의 시간대(정각 칸) 넘기기. 칸 키는 "2026-11-02T09" 꼴이라 글자 순서가 곧 시간 순서다.
 *
 * 한 화면에는 한 칸의 질문 · 일기만 보인다(사용자 결정). 감정일기에 들어오면 늘 지금 시각의 칸부터
 * 보여준다(사용자 결정 — 예전에는 오늘 질문의 칸을 먼저 보여줬다). 왼쪽 빈 곳을 누르면 이전 칸, 오른쪽은
 * 다음 칸으로 간다.
 * 넘겨 볼 칸은 질문이 있는 칸과 지금 칸뿐이다 — 9시에 질문하고 17시에 다시 질문했으면 9시 다음은 바로
 * 17시다(사용자 결정). 질문 없이 일기만 있는 칸은 건너뛴다.
 */

/** 오늘 질문의 칸(서버가 준 `slotStartAt`). 오늘 질문이 없으면 undefined. */
export function getQuestionSlot(question: RoomQuestion | null | undefined, now: Date): string | undefined {
  if (!question || !isTodayQuestion(question, now)) return undefined;
  return getHourSlotKey(question.slotStartAt);
}

/**
 * 넘겨 볼 수 있는 칸 목록, 최신순. 질문이 있는 칸(실패한 질문은 보여줄 것이 없어 뺀다) + 오늘 질문의 칸 +
 * 지금 시각의 칸(처음 보여주는 칸이고, 여기서 새 질문을 만든다). 지금보다 뒤의 칸은 없다.
 */
export function getSlotKeys(
  history: Pick<RoomQuestionHistoryItem, 'slotStartAt' | 'status'>[],
  question: RoomQuestion | null | undefined,
  now: Date,
): string[] {
  const nowSlot = getKstHourSlotKey(now);
  const keys = new Set<string>([nowSlot]);
  const questionSlot = getQuestionSlot(question, now);
  if (questionSlot !== undefined) keys.add(questionSlot);
  for (const item of history) {
    const key = item.status === 'failed' ? undefined : getHourSlotKey(item.slotStartAt);
    if (key !== undefined) keys.add(key);
  }
  return [...keys].filter((key) => key <= nowSlot).sort((a, b) => b.localeCompare(a));
}

/**
 * 진행 막대에 그릴 칸 — 보고 있는 칸과 같은 날(KST)의 칸, 오래된 순. 칸 목록이 지금 칸까지라 오늘이면 지금
 * 칸이 늘 마지막이다 — 오늘 질문이 하나뿐이면 한 칸, 이전 칸이 하나 더 있으면 두 칸(사용자 결정).
 */
export function getDaySlots(slots: string[], slot: string): string[] {
  const day = slot.slice(0, 10);
  return slots.filter((key) => key.startsWith(day)).reverse();
}

/** 지금 칸보다 하나 앞(오래된 쪽) 칸. `slot` 이 목록에 없어도(질문 없는 날) 시간 순서로 찾는다. */
export function getOlderSlot(slots: string[], slot: string): string | undefined {
  return slots.find((key) => key < slot);
}

/** 지금 칸보다 하나 뒤(최근 쪽) 칸. */
export function getNewerSlot(slots: string[], slot: string): string | undefined {
  return slots.filter((key) => key > slot).at(-1);
}

/**
 * 질문이 없는 날을 가리키는 칸 키 — "2026-11-01T". 시(時)가 없어서 어떤 일기 · 질문과도 맞지 않고, 글자
 * 순서로는 그날 0시 칸보다 앞이라 앞뒤 칸 찾기가 그대로 된다.
 */
export function toEmptyDaySlot(date: string): string {
  return `${date}T`;
}

/** `toEmptyDaySlot` 으로 만든 칸인지. */
export function isEmptyDaySlot(slot: string): boolean {
  return slot.length === 11;
}

/** 달력에서 고른 날(KST "YYYY-MM-DD")에 보여줄 칸 — 그날의 가장 늦은 질문 칸, 없으면 빈 날 칸. */
export function resolveDateSlot(slots: string[], date: string): string {
  return slots.find((key) => key.startsWith(date)) ?? toEmptyDaySlot(date);
}

/** 두 질문 목록을 합친다(같은 질문은 하나만). 지난 질문 50개 + 달력에서 고른 날의 질문. */
export function mergeQuestionHistory(
  base: RoomQuestionHistoryItem[],
  extra: RoomQuestionHistoryItem[],
): RoomQuestionHistoryItem[] {
  const ids = new Set(base.map((item) => item.questionId));
  return [...base, ...extra.filter((item) => !ids.has(item.questionId))];
}

/** 그 칸에 쓴 일기만. 순서는 그대로 둔다. */
export function filterSlotDiaries<T extends { createdAt: string }>(diaries: T[], slot: string): T[] {
  return diaries.filter((item) => getHourSlotKey(item.createdAt) === slot);
}

/** 지난 칸의 질문 — 내용이 있는(ready) 것만. 없으면 undefined. */
export function findSlotQuestion(
  history: RoomQuestionHistoryItem[],
  slot: string,
): RoomQuestionHistoryItem | undefined {
  return history.find(
    (item) => item.status === 'ready' && item.content !== null && getHourSlotKey(item.slotStartAt) === slot,
  );
}
