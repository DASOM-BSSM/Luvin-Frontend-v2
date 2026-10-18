import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { INFERNO_EPISODES } from '@/src/features/inferno/constants/episodes';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';
import type { InfernoEpisode } from '@/src/features/inferno/types';

/**
 * 아직 안 본 에피소드 중 가장 앞선 것. 전부 봤으면 undefined.
 *
 * 순서를 건너뛸 수 없으므로(ep0 의 "순서를 건너뛸 순 없어요") 회차순으로 훑어 첫 미시청을 찾는다.
 */
export function findNextInfernoEpisode(completedOrders: number[]): InfernoEpisode | undefined {
  return INFERNO_EPISODES.find((episode) => !completedOrders.includes(episode.order));
}

/** 가이드 회차. 서버 시즌에는 없는 회차라 서버 값으로 직접 알 수 없다. */
const GUIDE_EPISODE_ORDER = 0;

/**
 * 서버 시즌 상태로 본 "끝낸 회차들". 기기에 기록이 없을 때(새 기기, 재설치) 대신 쓴다.
 *
 * `currentEpisode` 는 "끝낸 회차 + 1" 이 아니라 **"대화가 만들어진 마지막 회차 + 1"** 이다. 실기기에서
 * ep3 도중에 나갔는데도 `currentEpisode=4` 였고, 그 상태에서 ep4 생성은 `SELECTION_REQUIRED`(ep3 결과
 * 없음)로 거절됐다(LUV-56). 그래서 `currentEpisode` 보다 앞 회차를 끝냈다고 보면 진행 중인 회차를
 * 건너뛴다.
 *
 * 끝냈다고 볼 수 있는 건 **다음 회차 대화까지 만들어진 회차**뿐이다 — 다음 회차 대화는 그 회차에
 * 들어가야 만들어지고, 홈은 앞 회차를 끝내야 다음 회차를 보여주기 때문이다(order + 1 < currentEpisode).
 * ep0(가이드)은 ep1 대화가 만들어졌으면(= ep1 에 들어갔으면) 지나온 것이다. 시즌이 끝났으면 전부다.
 */
export function getServerCompletedOrders(
  season: Pick<AiSeasonStatusView, 'status' | 'currentEpisode'> | undefined,
): number[] {
  if (!season) {
    return [];
  }

  if (season.status === COMPLETED_SEASON_STATUS) {
    return INFERNO_EPISODES.map((episode) => episode.order);
  }

  return INFERNO_EPISODES.map((episode) => episode.order).filter((order) =>
    order === GUIDE_EPISODE_ORDER ? season.currentEpisode > 1 : order + 1 < season.currentEpisode,
  );
}

/**
 * 기기에 남은 진행 기록과 서버 기록을 합친다(회차순, 중복 없음).
 *
 * 기기 기록은 계정별로 남지만(inferno-store) 새 기기·재설치면 비어 있다. 그때도 서버 기록은 계정에
 * 묶여 남아 있어서 진행도가 처음부터로 돌아가지 않는다. 서버 기록은 한 회차 늦게 잡히므로(위 주석)
 * 기기에서 방금 끝낸 회차는 기기 기록이 채운다.
 */
export function mergeCompletedOrders(
  localOrders: number[],
  season: Pick<AiSeasonStatusView, 'status' | 'currentEpisode'> | undefined,
): number[] {
  return [...new Set([...localOrders, ...getServerCompletedOrders(season)])].sort((a, b) => a - b);
}
