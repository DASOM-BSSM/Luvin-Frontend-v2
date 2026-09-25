import { useEffect } from 'react';

import useMinigames from '@/src/features/minigames/hooks/use-minigames';
import usePlayMinigame from '@/src/features/minigames/hooks/use-play-minigame';
import type { GamePhase } from '@/src/features/luvin-hell/types';

/**
 * 판이 끝나면(success/fail) 서버에 결과를 보고한다(§11 — 화면은 이 훅 하나만 부르면 된다).
 *
 * `gameTitle` 은 `GET /api/minigames` 목록의 `title` 과 정확히 같아야 매칭되고, 못 찾으면
 * 조용히 건너뛴다 — 서버 목록에 아직 이 게임이 없어도 로컬 플레이 자체는 막지 않기 위함이다.
 *
 * 보상 토큰은 여기서 반영하지 않는다 — 로컬 엔진(`createRunStore`)이 미션 난이도에 따라
 * 계산한 가변 보상을 이미 즉시 지급하고 있는데, 이 API 는 게임당 고정 보상(`rewardToken`)만
 * 돌려줘서 둘이 다를 수 있다. 그 차이를 지금 임의로 맞추지 않고, 결과 기록만 서버에 남긴다.
 */
export default function useReportMinigameResult(gameTitle: string, phase: GamePhase) {
  const minigamesQuery = useMinigames();
  const playMutation = usePlayMinigame();

  useEffect(() => {
    if (phase !== 'success' && phase !== 'fail') {
      return;
    }

    const game = minigamesQuery.data?.find((item) => item.title === gameTitle);
    if (!game) {
      return;
    }

    playMutation.mutate({ gameId: game.gameId, outcome: phase === 'success' ? 'success' : 'fail' });
    // phase 가 success/fail 로 바뀌는 순간에만 한 번 보고한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
}
