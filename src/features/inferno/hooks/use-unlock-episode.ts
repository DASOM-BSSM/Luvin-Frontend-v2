/**
 * [DRAFT] 회차 열기. 응답에는 시즌 상태가 없어서(계약 v3) 성공하면 `GET /me` 를 다시 받아
 * `story.unlockedOrders` 를 갱신하고, 남은 토큰을 반영한 뒤 회차 본문을 요청한다.
 * 409 `INSUFFICIENT_TOKENS` 는 화면이 안내한다. 그 응답에 실려 온 잔액으로 보유 토큰을 바로 맞춘다.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getStoryTokenBalance, unlockEpisode } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';
import { getInsufficientTokenBalance } from '@/src/features/inferno/utils/story-error';

export default function useUnlockEpisode(order: number, onUnlocked: () => void) {
  const client = useQueryClient();
  const setBalance = useTokenStore((state) => state.setBalance);
  const balance = useQuery({
    queryKey: storyKeys.tokenBalance,
    queryFn: getStoryTokenBalance,
  });
  const unlock = useMutation({
    mutationFn: () => unlockEpisode(order),
    onSuccess: async ({ tokenBalance }) => {
      if (tokenBalance !== undefined) setBalance(tokenBalance);
      void client.invalidateQueries({ queryKey: tokenKeys.balance });
      void client.invalidateQueries({ queryKey: storyKeys.tokenBalance });
      // 열린 회차 목록이 `GET /me` 의 story 에 있어서 그걸 먼저 받아야 본문 요청이 풀린다.
      await client.refetchQueries({ queryKey: aiSeasonKeys.status });
      void client.invalidateQueries({ queryKey: storyKeys.content(order) });
      onUnlocked();
    },
    onError: (error) => {
      const latest = getInsufficientTokenBalance(error);
      if (latest === null) return;
      setBalance(latest);
      client.setQueryData(storyKeys.tokenBalance, latest);
    },
  });
  return { balance, unlock };
}
