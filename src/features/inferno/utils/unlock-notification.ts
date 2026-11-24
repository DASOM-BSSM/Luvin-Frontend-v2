/**
 * [DRAFT] 다음 회차 공개 알림 계획. 순수 함수(§4).
 *
 * 앞 회차를 끝내면 서버가 소금빵으로 다음 회차를 열 수 있는 시각(`nextUnlockAt`)을 준다. 그 시각에 기기
 * 로컬 알림을 하나 예약한다 — 공개 주기는 여기서 계산하지 않고 서버 값만 쓴다.
 */
import {
  FREE_EPISODE_ORDERS,
  INFERNO_EPISODES,
} from '@/src/features/inferno/constants/episodes';
import type { StoryState } from '@/src/features/inferno/types/story';

/** 알림 `data.kind`. 탭했을 때 이 알림인지 가린다. */
export const UNLOCK_NOTIFICATION_KIND = 'episode-unlock';

export interface UnlockNotificationPlan {
  order: number;
  episodeTitle: string;
  /** 알림이 울릴 시각(ms). */
  at: number;
}

/** 예약할 알림. 기다릴 회차가 없거나 이미 열 수 있으면 null. */
export function planUnlockNotification(
  story: Pick<StoryState, 'nextUnlockAt' | 'completedOrders'>,
  now: number,
): UnlockNotificationPlan | null {
  if (story.nextUnlockAt === null) return null;
  const at = Date.parse(story.nextUnlockAt);
  if (Number.isNaN(at) || at <= now) return null;

  const order = Math.max(0, ...story.completedOrders) + 1;
  // 1~3화는 토큰도 대기도 없이 바로 열린다 — 기다릴 게 없으니 알림도 걸지 않는다.
  if (FREE_EPISODE_ORDERS.includes(order)) return null;
  const episode = INFERNO_EPISODES.find((item) => item.order === order);
  if (!episode) return null;

  return { order, episodeTitle: episode.title, at };
}

export function unlockNotificationTitle(order: number): string {
  return `러빈지옥 ${order}화가 열렸어요`;
}

export function unlockNotificationBody(episodeTitle: string): string {
  return `'${episodeTitle}' 이야기를 보러 갈까요?`;
}

/** 알림에 실어 보낸 회차 번호를 읽는다. 다른 알림이면 null. */
export function readUnlockNotificationOrder(data: unknown): number | null {
  if (typeof data !== 'object' || data === null) return null;
  const { kind, order } = data as { kind?: unknown; order?: unknown };
  if (kind !== UNLOCK_NOTIFICATION_KIND || typeof order !== 'number') return null;
  return order;
}
