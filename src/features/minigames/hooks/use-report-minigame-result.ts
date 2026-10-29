import { useEffect, useRef } from 'react';

import useMinigames from '@/src/features/minigames/hooks/use-minigames';
import usePlayMinigame from '@/src/features/minigames/hooks/use-play-minigame';
import type { GamePhase } from '@/src/features/luvin-hell/types';

/** 서버 목록에서 이 게임을 찾는 기준. `code` 는 title 과 달리 바뀌지 않아 더 안전하다. */
export type MinigameMatchBy = 'title' | 'code';

/**
 * 판이 끝나면(success/fail) 서버에 결과를 보고한다(§11 — 화면은 이 훅 하나만 부르면 된다).
 *
 * `gameKey` 는 `GET /api/minigames` 목록의 `title`(기본) 또는 `code`(`matchBy='code'`)와 정확히
 * 같아야 매칭되고, 못 찾으면 조용히 건너뛴다 — 서버 목록에 아직 이 게임이 없어도 로컬 플레이
 * 자체는 막지 않기 위함이다.
 *
 * 보상 토큰은 여기서 반영하지 않는다 — 로컬 엔진(`createRunStore`)이 성공 즉시 고정
 * 보상(`FIXED_MINIGAME_REWARD`)을 이미 지급했고, 서버 잔액은 `useTokenBalance`가 따로
 * 동기화한다(§ createRunStore.ts 주석 — 예전엔 난이도별 가변 보상이었는데, 백엔드가 게임당
 * 고정 보상만 지원해서 둘을 고정 1개로 통일했다). 이 훅은 결과 기록만 서버에 남긴다.
 *
 * 예외: 빵굽기(`matchBy='code'`)는 로컬 선지급이 없다 — 서버 응답의 `reward.token`을
 * `usePlayMinigame` 이 잔액 캐시에 반영하는 것이 유일한 지급 경로다.
 */
export default function useReportMinigameResult(
  gameKey: string, phase: GamePhase, matchBy: MinigameMatchBy = 'title',
) {
  const minigamesQuery = useMinigames();
  const playMutation = usePlayMinigame();
  // 이번 판을 이미 보고했는지. 판이 끝난 순간 목록이 아직 로딩 중이면 목록이 도착했을 때
  // 보고해야 하므로(안 그러면 서버 지급이 통째로 빠진다) phase 만이 아니라 목록 도착에도
  // 반응하되, 한 판에 두 번 보고하지 않도록 막는다.
  const hasReportedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'success' && phase !== 'fail') {
      hasReportedRef.current = false;
      return;
    }
    if (hasReportedRef.current) {
      return;
    }

    const game = minigamesQuery.data?.find((item) => item[matchBy] === gameKey);
    if (!game) {
      if (__DEV__ && minigamesQuery.data) {
        // 목록은 왔는데 이름이 안 맞으면 서버 지급이 통째로 빠진다 — 토큰이 사라지는 원인 추적용.
        console.warn(
          `[useReportMinigameResult] ${matchBy} '${gameKey}' 를 서버 목록에서 못 찾음:`,
          minigamesQuery.data.map((item) => item[matchBy]),
        );
      }
      return;
    }

    hasReportedRef.current = true;
    playMutation.mutate(
      { gameId: game.gameId, outcome: phase === 'success' ? 'success' : 'fail' },
      {
        onSuccess: (result) => {
          if (__DEV__) {
            console.log(`[useReportMinigameResult] gameId=${game.gameId} ${phase} -> reward.token=${result.reward?.token}`);
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, minigamesQuery.data]);
}
