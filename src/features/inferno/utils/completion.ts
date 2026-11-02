/**
 * 회차 완료(비동기) 판단. 순수 함수(§6).
 *
 * 1~9화는 "에피소드 끝내기"에서 완료 요청만 보내고 바로 나간다. 서버가 정리하는 동안(`completion`)
 * 다음 회차는 열기·본문 요청을 미루고 생성 대기 화면을 보여준다(서버가 409 로 막기 때문).
 */
import type { StoryState } from '@/src/features/inferno/types/story';

/** 바로 앞 회차를 서버가 아직 정리 중인지. 이때 이 회차는 열기·본문 요청을 하지 않고 기다린다. */
export function isPreviousCompleting(order: number, story: StoryState | undefined): boolean {
  return story?.completion?.order === order - 1 && story.completion.status === 'completing';
}

/** 정리가 끝났는지(진행 중 표시가 사라지고 완료 목록에 들어감). */
export function isCompletionSettled(order: number, story: StoryState | undefined): boolean {
  return !story?.completion && (story?.completedOrders ?? []).includes(order);
}

/** 정리에 실패해서 완료 요청을 다시 보내야 하는 회차. 없으면 null. */
export function failedCompletionOrder(story: StoryState | undefined): number | null {
  return story?.completion?.status === 'failed' ? story.completion.order : null;
}

/** 쪽지 도착을 기다리는 중이라 안 읽은 쪽지를 다시 받아야 하는지(받은 쪽지가 없고 기한 전). */
export function shouldPollLetter(waitUntil: number | null, now: number, hasLetter: boolean): boolean {
  return !hasLetter && waitUntil !== null && now < waitUntil;
}
