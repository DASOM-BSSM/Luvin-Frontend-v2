import { create, type StoreApi, type UseBoundStore } from 'zustand';

import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import type { RunStore } from '@/src/features/luvin-hell/engine/types';
import { hasMetMissionTarget, rewardForTarget, rollMissionTarget } from '@/src/features/luvin-hell/engine/utils/missionTarget';
import type { MissionRange } from '@/src/features/luvin-hell/types';

/** 모든 미니게임 공통 시작 하트 수. 공통 규칙: 어떤 실패든 하트 -1, 0이 되면 실패 처리. */
const INITIAL_HEARTS = 3;

/**
 * 런(하트/점수/미션/phase) 상태 스토어 **팩토리**.
 *
 * 절대 모듈 스코프 싱글턴으로 두지 않는다 — 두 게임이 각자 `createRunStore()`를 호출해
 * 서로 다른 인스턴스를 쓴다. 한쪽 게임의 진행 상태가 다른 게임으로 새어 들어가는 것을 막기 위함
 * (엔진 아키텍처 검토에서 나온 권고).
 */
export function createRunStore(): UseBoundStore<StoreApi<RunStore>> {
  return create<RunStore>((set, get) => ({
    phase: 'ready',
    hearts: INITIAL_HEARTS,
    score: 0,
    missionTarget: 0,
    reward: 0,
    missionRange: [0, 0],

    begin: (missionRange: MissionRange) => {
      const missionTarget = rollMissionTarget(missionRange);
      set({
        phase: 'ready',
        hearts: INITIAL_HEARTS,
        score: 0,
        missionTarget,
        reward: rewardForTarget(missionTarget, missionRange),
        missionRange,
      });
    },

    startPlaying: () => {
      if (get().phase === 'ready') set({ phase: 'playing' });
    },

    registerHit: () => {
      if (get().phase !== 'playing') return;
      const hearts = get().hearts - 1;
      set({ hearts, phase: hearts <= 0 ? 'fail' : 'playing' });
    },

    setScore: (score: number) => {
      if (get().phase !== 'playing') return;
      const { missionTarget, reward } = get();
      if (hasMetMissionTarget(score, missionTarget)) {
        set({ score, phase: 'success' });
        useTokenStore.getState().addTokens(reward);
      } else {
        set({ score });
      }
    },

    restart: () => get().begin(get().missionRange),
  }));
}
