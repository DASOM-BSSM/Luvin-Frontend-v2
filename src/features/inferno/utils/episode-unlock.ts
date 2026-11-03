/** [DRAFT] 회차 열기(토큰) 판단. 순수 함수(§6). */
import { FREE_EPISODE_ORDERS } from '@/src/features/inferno/constants/episodes';
import type { StoryState } from '@/src/features/inferno/types/story';

export type EpisodeAccess = 'free' | 'unlocked' | 'locked';

/**
 * 1~3화는 무료, 4화 이상은 처음 열 때 토큰을 한 번 쓴다. 이미 열었거나 끝낸 회차는 다시 볼 때
 * 무료다. 기준은 서버 `story.unlockedOrders`.
 */
export function episodeAccess(order: number, story: StoryState | undefined): EpisodeAccess {
  if (FREE_EPISODE_ORDERS.includes(order)) return 'free';
  if (story && (story.unlockedOrders.includes(order) || story.completedOrders.includes(order)))
    return 'unlocked';
  return 'locked';
}
