import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';

/**
 * 이 회차를 "다시 보기"로 여는 건지. 이미 끝낸 회차이거나 시즌이 끝났으면 다시 보기다. 다시 보기에서는
 * 투표 모달을 띄우지 않고, 투표지는 이미 고른 반죽이 선택된 채로만 보여주며, 서버에 결과를 다시 보내지
 * 않는다.
 *
 * 예전에는 "서버의 현재 회차보다 앞" 이면 다시 보기로 봤는데, 서버의 `currentEpisode` 는 대화가 만들어진
 * 마지막 회차 + 1 이라(progress.ts 주석) 대화만 보고 나간 회차도 다시 보기가 됐다. 그러면 ep3 도중에
 * 나갔다 들어오면 미니게임·투표가 막혀 ep3 결과를 영영 보낼 수 없었다(LUV-56). 그래서 끝낸 회차 목록
 * (기기 기록 + 서버 기록, use-inferno-progress)으로 판단한다.
 */
export function isEpisodeReplay(
  order: number,
  season: Pick<AiSeasonStatusView, 'status'>,
  completedOrders: number[],
): boolean {
  return season.status === COMPLETED_SEASON_STATUS || completedOrders.includes(order);
}
