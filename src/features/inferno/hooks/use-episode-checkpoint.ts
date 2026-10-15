import { useState } from 'react';

import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { readCheckpoint, useInfernoStore } from '@/src/features/inferno/store/inferno-store';

/**
 * 회차의 "잠시 나가기" 이어보기. 들어올 때 이어볼 자리(`initialStep`)를 주고, 나갈 때 지금 자리를
 * 남긴다(`saveStep`). "잠시 나가기" 는 무조건 보던 자리에서 이어봐야 한다(사용자 결정).
 *
 * `initialStep` 은 회차에 들어온 순간의 값으로 고정한다 — 흐름 훅들이 처음 한 번만 읽는다.
 * 자리 번호의 뜻(대화 몇 쪽, 투표지 등)은 회차마다 다르고, 각 회차 흐름 훅이 정한다.
 */
export default function useEpisodeCheckpoint(order: number) {
  const seasonId = useAiSeasonStatus().data?.seasonId;
  const checkpoints = useInfernoStore((state) => state.checkpoints);
  const saveCheckpoint = useInfernoStore((state) => state.saveCheckpoint);
  const [initialStep] = useState(() => readCheckpoint(checkpoints, order, seasonId) ?? 0);

  function saveStep(step: number) {
    saveCheckpoint(order, step, seasonId);
  }

  return { initialStep, saveStep };
}
