/** [DRAFT] 오븐 회차 목록. 시즌은 사용자마다 하나라 지금 시즌의 회차만 보여준다(사용자 결정). */
import type { BreadProfile } from '@/src/features/home/types';
import { formatEpisodeLabel } from '@/src/features/home/utils/format-episode';
import type { StoryState } from '@/src/features/inferno/types/story';
import { getBreadFlavorName } from '@/src/features/inferno/utils/character-persona';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import type { SeasonEpisodeItem } from '@/src/features/oven/components/season-card';

/** 회차가 열 편(ep1~ep10)이라 끝난 시즌은 여기까지 펼친다. ep0(가이드)은 목록에 넣지 않는다. */
export const LAST_EPISODE_ORDER = 10;

/** Episode 01 부터 lastOrder 까지, 최신 회차가 맨 위. */
export function toEpisodeOrders(lastOrder: number): number[] {
  const count = Math.min(Math.max(lastOrder, 0), LAST_EPISODE_ORDER);
  return Array.from({ length: count }, (_, index) => count - index);
}

/** ep1 제목은 내 반죽 이름이 들어간 인사말이라 회차 목록에서도 그렇게 보여준다. */
const GREETING_EPISODE_ORDER = 1;

function resolveEpisodeTitle(order: number, myProfile: BreadProfile): string | undefined {
  if (order === GREETING_EPISODE_ORDER) {
    return `안녕하세요 ${getBreadFlavorName(myProfile.type)}입니다!`;
  }

  return findInfernoEpisode(order)?.title;
}

/** [DRAFT] 회차 목록에 붙는 열기 상태. 1~3화 무료, 4화부터는 `story.unlockedOrders` 기준. */
const ACCESS_BADGES = { free: '무료', unlocked: '열림', locked: '🔒 잠김' } as const;

export function accessBadge(order: number, story: StoryState | undefined): string {
  return ACCESS_BADGES[episodeAccess(order, story)];
}

export function toSeasonEpisodes(
  orders: number[],
  myProfile: BreadProfile,
  story?: StoryState,
): SeasonEpisodeItem[] {
  return orders.flatMap((order) => {
    const title = resolveEpisodeTitle(order, myProfile);
    return title
      ? [{ order, label: formatEpisodeLabel(order), body: title, badge: accessBadge(order, story) }]
      : [];
  });
}
