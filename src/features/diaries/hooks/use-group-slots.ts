import { useState } from 'react';

import useCurrentQuestion from '@/src/features/diaries/hooks/use-current-question';
import useQuestionHistory from '@/src/features/diaries/hooks/use-question-history';
import useQuestionsOnDate from '@/src/features/diaries/hooks/use-questions-on-date';
import type { RoomId } from '@/src/features/diaries/types';
import {
  findSlotQuestion,
  getDaySlots,
  getNewerSlot,
  getOlderSlot,
  getQuestionSlot,
  getSlotKeys,
  isEmptyDaySlot,
  mergeQuestionHistory,
  resolveDateSlot,
  toEmptyDaySlot,
} from '@/src/features/diaries/utils/hour-slot';
import { getKstDateString, getKstHourSlotKey } from '@/src/features/diaries/utils/question';

/** 무엇을 골랐는지 — 좌우로 넘긴 칸, 또는 달력에서 고른 날. 아무것도 안 골랐으면 지금 칸. */
type SlotSelection = { kind: 'slot'; slot: string } | { kind: 'date'; date: string } | undefined;

/**
 * 감정일기 메인에서 지금 보는 시간대(정각 칸)와 앞뒤 칸. 지금 질문 · 지난 질문은 질문 칸과 같은 쿼리라
 * 캐시를 같이 쓴다. 진행 막대(머리)와 본문(GroupSlotBody)이 같은 칸을 봐야 해서 화면에서 한 번 부른다.
 *
 * 달력에서 날을 고르면 그날 질문을 따로 받아(`useQuestionsOnDate` — 지난 질문 50개 밖의 날일 수 있다)
 * 그날의 가장 늦은 질문 칸을 보여준다. 그날 질문이 없으면 빈 날 칸(`toEmptyDaySlot`)이다. 오늘 이후를
 * 고르면 지금 칸으로 돌아간다.
 */
export default function useGroupSlots(roomId: RoomId) {
  const questionQuery = useCurrentQuestion(roomId);
  const history = useQuestionHistory(roomId, true).data ?? [];
  const [selection, setSelection] = useState<SlotSelection>();
  const selectedDate = selection?.kind === 'date' ? selection.date : undefined;
  const dateQuery = useQuestionsOnDate(roomId, selectedDate);

  const now = new Date();
  const question = questionQuery.data;
  const allHistory = mergeQuestionHistory(history, dateQuery.data ?? []);
  const slots = getSlotKeys(allHistory, question, now);
  const nowSlot = getKstHourSlotKey(now);

  function resolveSlot(): string {
    if (selection?.kind === 'slot' && slots.includes(selection.slot)) return selection.slot;
    if (selection?.kind === 'date') {
      // 그날 질문을 받는 동안에는 빈 날 칸으로 두고 "불러오는 중"을 보여준다.
      return dateQuery.isSuccess ? resolveDateSlot(slots, selection.date) : toEmptyDaySlot(selection.date);
    }
    return nowSlot;
  }

  const slot = resolveSlot();
  const daySlots = getDaySlots(slots, slot);
  const progressIndex = daySlots.indexOf(slot);

  function selectSlot(next: string) {
    setSelection({ kind: 'slot', slot: next });
  }

  function selectDate(date: string) {
    // 오늘 · 앞날은 지금 칸이다.
    setSelection(date >= getKstDateString(now) ? undefined : { kind: 'date', date });
  }

  return {
    slot,
    /** 오늘 질문이 만들어진 칸. 이 칸에서는 지금 질문(만들기 · 답 모달)을 그대로 보여준다. */
    questionSlot: getQuestionSlot(question, now),
    /** 지금 시각의 칸. 일기는 이 칸에서만 새로 쓸 수 있다. */
    nowSlot,
    pastQuestion: findSlotQuestion(allHistory, slot),
    olderSlot: getOlderSlot(slots, slot),
    newerSlot: getNewerSlot(slots, slot),
    /** 달력에서 고른 날에 질문이 없다(받는 중 포함). */
    isEmptyDay: isEmptyDaySlot(slot),
    isDayLoading: selectedDate !== undefined && dateQuery.isLoading,
    isDayError: selectedDate !== undefined && dateQuery.isError,
    retryDay: dateQuery.refetch,
    /** 진행 막대의 칸(보고 있는 날의 칸, 오래된 순 — 오늘이면 지금 칸이 마지막). */
    daySlots,
    /** 진행 막대에서 칠할 칸. 빈 날이면 undefined. */
    progressIndex: progressIndex >= 0 ? progressIndex : undefined,
    selectSlot,
    selectDate,
  };
}

export type GroupSlots = ReturnType<typeof useGroupSlots>;
