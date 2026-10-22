/** [DRAFT] Ten-episode block story integration. */
import type { BreadProfile } from '@/src/features/home/types';
import { formatEpisodeLabel } from '@/src/features/home/utils/format-episode';
import type { AiSeasonSummaryView } from '@/src/features/inferno/api/ai-season-types';
import { LEGACY_INFERNO_EPISODES } from '@/src/features/inferno/constants/episodes';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';
import { getBreadFlavorName } from '@/src/features/inferno/utils/character-persona';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import type { SeasonEpisodeItem } from '@/src/features/oven/components/season-card';

/** 오븐 화면의 시즌 카드 하나. */
export interface SeasonHistory {
  seasonId: string;
  /** 1부터. "SEASON 01" 로 보인다. */
  seasonNumber: number;
  /** 펼쳤을 때 보여줄 회차 번호. 최신 회차가 맨 위다(시안 이미지 순서). */
  episodeOrders: number[];
  /**
   * 지금 진행 중인 시즌인지. 지난 시즌 회차는 시즌 id 를 붙여 읽기 전용으로 연다 — 회차 조회 API 가
   * `season_id` 로 시즌을 고를 수 있다(use-viewed-season).
   */
  isCurrent: boolean;
}

/** 회차가 열 편(ep1~ep10)이라 끝난 시즌은 여기까지 펼친다. ep0(가이드)은 목록에 넣지 않는다. */
export const LAST_EPISODE_ORDER = 10;

/** Episode 01 부터 lastOrder 까지, 최신 회차가 맨 위. */
function toEpisodeOrders(lastOrder: number): number[] {
  const count = Math.min(Math.max(lastOrder, 0), LAST_EPISODE_ORDER);
  return Array.from({ length: count }, (_, index) => count - index);
}

/**
 * 지난 시즌에서 펼칠 마지막 회차. 끝난 시즌이면 ep5 까지다.
 *
 * 끝나지 않은 채 남은 시즌은 대화가 만들어진 회차까지만 보여준다. `currentEpisode` 는 "대화가 만들어진
 * 마지막 회차 + 1" 이라(inferno/utils/progress.ts 주석) 그대로 쓰면 시작도 안 한 회차가 목록에 나온다.
 */
function pastSeasonLastOrder(season: AiSeasonSummaryView): number {
  return season.status === COMPLETED_SEASON_STATUS ? 5 : Math.min(5, season.currentEpisode - 1);
}

/**
 * 시즌 목록을 카드 순서로 바꾼다. 최신 시즌이 맨 위, 지난 시즌이 그 아래다(사용자 결정).
 *
 * - `seasonNumber` 가 없는 옛 시즌은 만든 순서로 번호를 매긴다.
 * - 지금 시즌은 홈의 "이번주 에피소드" 까지 펼친다(`currentLastOrder`) — 끝낸 회차와 지금 볼 회차다.
 *   서버 `currentEpisode` 를 쓰지 않는 이유는 pastSeasonLastOrder 주석과 같다. 지금 볼 회차까지 넣는 건
 *   홈과 같은 회차를 여기서도 이어 볼 수 있게 하려는 것이다.
 * - 지금 시즌을 아직 모르면 가장 최근 시즌을 지금 시즌으로 본다.
 */
export function buildSeasonHistories(
  seasons: AiSeasonSummaryView[],
  currentSeasonId: string | undefined,
  /** 지금 시즌에서 펼칠 마지막 회차. 끝낸 회차 다음 회차(홈의 이번주 에피소드), 다 끝냈으면 ep5. */
  currentLastOrder: number,
): SeasonHistory[] {
  const oldestFirst = [...seasons].sort(compareSeasonsOldestFirst);
  const resolvedCurrentSeasonId = currentSeasonId ?? oldestFirst[oldestFirst.length - 1]?.seasonId;

  return oldestFirst
    .map((season, index) => {
      const isCurrent = season.seasonId === resolvedCurrentSeasonId;

      return {
        seasonId: season.seasonId,
        seasonNumber: season.seasonNumber ?? index + 1,
        episodeOrders: toEpisodeOrders(isCurrent ? currentLastOrder : pastSeasonLastOrder(season)),
        isCurrent,
      };
    })
    .reverse();
}

function compareSeasonsOldestFirst(a: AiSeasonSummaryView, b: AiSeasonSummaryView): number {
  if (a.seasonNumber !== undefined && b.seasonNumber !== undefined) {
    return a.seasonNumber - b.seasonNumber;
  }

  return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
}

/** ep1 은 회차 대본과 무관하게 "안녕하세요 {유저 반죽}입니다!"로 고정한다(사용자 지정). */
const GREETING_EPISODE_ORDER = 1;

function buildGreetingTitle(myProfile: BreadProfile): string {
  return `안녕하세요 ${getBreadFlavorName(myProfile.type)}입니다!`;
}

/**
 * 회차 한 편의 제목 문구. ep0/3/5는 고정 문구(INFERNO_EPISODES)를 그대로 쓰고, ep1은
 * 유저의 실제 반죽으로 인사말을 만든다. **ep2/ep4는 아직 미확정** — "사용자가 하트를 누른
 * 대화"를 보여줘야 하는데, 그 하트가 데이터에 미리 박힌 장식(`showHeart`)인지 유저가 직접
 * 누르는 상호작용인지 확인 전이라 일단 고정 문구를 그대로 둔다(사용자 확인 대기).
 *
 * 지난 시즌의 ep1 도 지금 반죽으로 인사말을 만든다. 반죽은 처음 한 번 만들면 끝이고 시즌마다 새로
 * 만들지 않아서(사용자 확인), 모든 시즌의 반죽이 같다.
 */
function resolveEpisodeTitle(
  order: number,
  myProfile: BreadProfile,
  legacy: boolean,
): string | undefined {
  if (order === GREETING_EPISODE_ORDER) {
    return buildGreetingTitle(myProfile);
  }

  return legacy
    ? LEGACY_INFERNO_EPISODES.find((episode) => episode.order === order)?.title
    : findInfernoEpisode(order)?.title;
}

/**
 * 시즌 카드 아래에 펼칠 회차 줄들. `useInfernoStore.completedOrders`의 원래 주석대로
 * ("API 가 생기면 이 저장은 서버 상태로 대체될 자리") `AiSeasonStatusView.currentEpisode`가
 * 그 서버 상태다 — 회차 번호는 서버 값을 쓰고, 제목은 위 `resolveEpisodeTitle`이 정한다.
 * 제목을 못 만드는 회차는 뺀다.
 */
export function toSeasonEpisodes(
  orders: number[],
  myProfile: BreadProfile,
  legacy = false,
): SeasonEpisodeItem[] {
  return orders.flatMap((order) => {
    const title = resolveEpisodeTitle(order, myProfile, legacy);
    return title ? [{ order, label: formatEpisodeLabel(order), body: title }] : [];
  });
}
