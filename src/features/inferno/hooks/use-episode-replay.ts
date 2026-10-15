import { useEffect, useState } from 'react';

import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { useInfernoSelectionStore } from '@/src/features/inferno/store/selection-store';
import { isEpisodeReplay } from '@/src/features/inferno/utils/episode-replay';

/** useEpisodeReplay 가 돌려주는 값. 회차 흐름 훅들이 받는다. */
export type EpisodeReplay = ReturnType<typeof useEpisodeReplay>;

/**
 * 이 회차를 다시 보기로 열었는지와, 그때 보여줄 "이미 고른 반죽".
 *
 * 다시 보기 여부는 회차에 들어온 순간 한 번만 정하고 고정한다 — ep1 에서 투표를 보내면 서버의
 * 현재 회차가 2 로 올라가는데, 그때 같은 화면이 갑자기 다시 보기로 바뀌면 안 되기 때문이다.
 *
 * `seasonId` 는 투표를 보낼 때 고른 반죽을 기록하는 데 쓴다(selection-store).
 */
export default function useEpisodeReplay(order: number) {
  const seasonQuery = useAiSeasonStatus();
  const season = seasonQuery.data;
  const [frozenIsReplay, setFrozenIsReplay] = useState<boolean | undefined>(undefined);
  const recordedSelection = useInfernoSelectionStore((state) =>
    season ? state.selections[season.seasonId]?.[order] : undefined,
  );

  useEffect(() => {
    if (frozenIsReplay === undefined && season) {
      setFrozenIsReplay(isEpisodeReplay(order, season));
    }
  }, [frozenIsReplay, season, order]);

  return {
    isReplay: frozenIsReplay === true,
    /** 다시 보기일 때 투표지에 선택해 둘 반죽. 기록이 없으면 undefined(아무것도 안 고른 채로 보인다). */
    replaySelectedId: recordedSelection,
    seasonId: season?.seasonId,
  };
}
