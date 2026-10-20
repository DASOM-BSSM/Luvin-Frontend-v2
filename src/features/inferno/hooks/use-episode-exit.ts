import type { Href } from 'expo-router';

import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import { leaveInferno } from '@/src/features/inferno/lib/leave-inferno';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';

/** 지금 시즌 회차를 나가면 홈으로, 지난 시즌 다시 보기를 나가면 들어왔던 오븐 화면으로 돌아간다. */
const CURRENT_SEASON_EXIT: Href = '/';
const PAST_SEASON_EXIT: Href = '/oven';

/**
 * 회차 화면에서 나가기. ep1~ep5 가 "잠시 나가기", "에피소드 끝내기" 에 쓴다.
 *
 * 지난 시즌을 다시 볼 때(use-viewed-season)는 회차를 끝냈다고 기록하지 않는다 — 기록은 지금 시즌
 * 진행도라서(inferno-store), 남기면 지금 시즌 홈이 그 회차를 건너뛴다. 이어보기 자리도 남기지 않으므로
 * (use-episode-checkpoint) 버튼 이름도 "잠시 나가기" 가 아니라 "나가기" 다.
 */
export default function useEpisodeExit(order: number) {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);
  const { isPastSeason } = useViewedSeason();

  function leave() {
    void leaveInferno(isPastSeason ? PAST_SEASON_EXIT : CURRENT_SEASON_EXIT);
  }

  /** 회차를 끝까지 봤다고 기록하고 나간다. 지난 시즌이면 기록하지 않는다. */
  function completeAndLeave() {
    if (!isPastSeason) {
      completeEpisode(order);
    }

    leave();
  }

  return {
    isPastSeason,
    skipLabel: isPastSeason ? '나가기' : '잠시 나가기',
    leave,
    completeAndLeave,
  };
}
