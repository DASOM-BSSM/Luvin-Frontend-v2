import type { Href } from 'expo-router';

/**
 * 회차 → 본문 라우트.
 *
 * 경로를 문자열로 조합하지 않고 표로 두는 이유가 둘이다. typedRoutes 가 켜져 있어 조합한
 * 문자열은 타입이 맞지 않고(§2), 라우트 경로 자체가 딥링크 계약이라 한곳에서만 다뤄야
 * 이름이 바뀔 때 빠뜨리지 않는다(§13).
 *
 * 본문이 아직 없는 회차는 여기에 없다. 없는 회차로는 들어가지 못하게 호출부가 막는다.
 */
const INFERNO_EPISODE_PATHNAMES = {
  0: '/inferno/ep0',
  1: '/inferno/ep1',
  2: '/inferno/ep2',
  3: '/inferno/ep3',
  4: '/inferno/ep4',
  5: '/inferno/ep5',
} as const;

export const INFERNO_EPISODE_HREFS: Record<number, Href | undefined> = INFERNO_EPISODE_PATHNAMES;

function isEpisodeOrder(order: number): order is keyof typeof INFERNO_EPISODE_PATHNAMES {
  return order in INFERNO_EPISODE_PATHNAMES;
}

/**
 * 회차 시작 화면으로 가는 링크. 시작 화면은 회차를 검색 파라미터로 받는다.
 *
 * `seasonId` 는 지난 시즌을 다시 볼 때만 넘긴다(오븐의 지난 시즌 카드). 시작 화면이 회차 본문으로
 * 그대로 넘겨 주고, 회차 화면은 그 시즌을 읽기 전용으로 보여준다(use-viewed-season). 선택 파라미터를
 * 하나 더한 것이라 기존 링크(`/inferno?order=1`)는 그대로 동작한다(§13).
 */
export function infernoIntroHref(order: number, seasonId?: string): Href {
  return { pathname: '/inferno', params: seasonId ? { order: String(order), seasonId } : { order: String(order) } };
}

/** 회차 본문 링크. `seasonId` 는 infernoIntroHref 와 같다. 본문이 없는 회차면 undefined. */
export function infernoEpisodeHref(order: number, seasonId?: string): Href | undefined {
  if (!isEpisodeOrder(order)) {
    return undefined;
  }

  const pathname = INFERNO_EPISODE_PATHNAMES[order];
  return seasonId ? { pathname, params: { seasonId } } : pathname;
}
