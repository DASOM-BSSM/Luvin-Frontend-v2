import { useMutation, useQueryClient } from '@tanstack/react-query';

import { playMinigame } from '@/src/features/minigames/api/minigames';
import type { MinigameOutcome, MinigamePlayResult } from '@/src/features/minigames/types';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';
import type { TokenBalance } from '@/src/features/tokens/types';

interface PlayMinigameInput {
  gameId: number;
  outcome: MinigameOutcome;
}

/**
 * 결과 보고 후 잔액 캐시를 반드시 갱신한다 — 안 하면 `useTokenBalance`가 게임 전에 캐시된
 * 잔액(staleTime 동안 재요청 안 함)으로 로컬에서 먼저 지급한 보상을 덮어써서, 홈에 다녀오면
 * 방금 번 토큰이 사라진 것처럼 보인다.
 */
export default function usePlayMinigame() {
  const queryClient = useQueryClient();

  const handlePlaySuccess = (result: MinigamePlayResult) => {
    queryClient.setQueryData<TokenBalance>(tokenKeys.balance, (prev) =>
      prev ? { ...prev, tokenBalance: prev.tokenBalance + result.reward.token } : prev,
    );
  };

  // 성공/실패 상관없이 서버 잔액을 다시 받아 최종값을 서버 기준으로 맞춘다.
  const handlePlaySettled = () => queryClient.invalidateQueries({ queryKey: tokenKeys.balance });

  return useMutation({
    mutationFn: ({ gameId, outcome }: PlayMinigameInput) => playMinigame(gameId, outcome),
    onSuccess: handlePlaySuccess,
    onSettled: handlePlaySettled,
  });
}
