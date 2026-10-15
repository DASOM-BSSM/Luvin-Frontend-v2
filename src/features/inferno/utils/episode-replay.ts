import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';

/**
 * 이 회차를 "다시 보기"로 여는 건지. 이미 지나간 회차(서버의 현재 회차보다 앞)이거나 시즌이
 * 끝났으면 다시 보기다. 다시 보기에서는 투표 모달을 띄우지 않고, 투표지는 이미 고른 반죽이
 * 선택된 채로만 보여주며, 서버에 결과를 다시 보내지 않는다.
 */
export function isEpisodeReplay(order: number, season: AiSeasonStatusView): boolean {
  return season.status === COMPLETED_SEASON_STATUS || season.currentEpisode > order;
}
