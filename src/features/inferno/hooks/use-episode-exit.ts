import type { Href } from 'expo-router';

import { leaveInferno } from '@/src/features/inferno/lib/leave-inferno';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';

/** 회차를 나가면 홈으로 돌아간다. */
const EPISODE_EXIT: Href = '/';

/**
 * 회차 화면에서 나가기. 회차 화면의 "잠시 나가기", "에피소드 끝내기" 에 쓴다.
 *
 * [DRAFT] 예전에는 지난 시즌 다시 보기면 오븐으로 돌아가고 완료 기록을 남기지 않았다. 시즌이 사용자마다
 * 하나가 되면서 그 분기를 뺐다(사용자 결정). 지금 시즌의 지난 회차 다시 보기는 회차 본문이 `completed`
 * 로 알아서 다시 보기 모드가 된다(inferno-episode-body).
 */
export default function useEpisodeExit(order: number) {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);

  function leave() {
    void leaveInferno(EPISODE_EXIT);
  }

  /** 회차를 끝까지 봤다고 기기에도 기록하고 나간다. */
  function completeAndLeave() {
    completeEpisode(order);
    leave();
  }

  return {
    skipLabel: '잠시 나가기',
    leave,
    completeAndLeave,
  };
}
