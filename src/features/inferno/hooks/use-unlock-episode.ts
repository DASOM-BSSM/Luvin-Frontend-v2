/**
 * [DRAFT] 회차 열기. 응답에는 시즌 상태가 없어서(계약 v3) 성공하면 `GET /me` 를 다시 받아
 * `story.unlockedOrders` 를 갱신하고, 남은 토큰을 반영한 뒤 회차 본문을 요청한다.
 * 409 `INSUFFICIENT_TOKENS` 는 화면이 안내한다. 그 응답에 실려 온 잔액으로 보유 토큰을 바로 맞춘다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unlockEpisode } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import useStoryTokenBalance from '@/src/features/inferno/hooks/use-story-token-balance';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';
import type { StoryTokenBalance } from '@/src/features/inferno/api/story-types';
import type { UnlockPayment } from '@/src/features/inferno/utils/unlock-options';
import {
  getInsufficientTokenBalance,
  getStoryErrorCode,
} from '@/src/features/inferno/utils/story-error';

export default function useUnlockEpisode(order: number, onUnlocked: () => void) {
  const client = useQueryClient();
  const setBalance = useTokenStore((state) => state.setBalance);
  const balance = useStoryTokenBalance();
  const unlock = useMutation({
    mutationFn: (payWith: UnlockPayment) => unlockEpisode(order, payWith),
    onSuccess: async ({ tokenBalance, breadTokenBalance }) => {
      if (tokenBalance !== undefined) setBalance(tokenBalance);
      if (tokenBalance !== undefined || breadTokenBalance !== undefined) {
        client.setQueryData<StoryTokenBalance>(storyKeys.tokenBalance, (prev) => ({
          salt: tokenBalance ?? prev?.salt ?? 0,
          bread: breadTokenBalance ?? prev?.bread ?? 0,
        }));
      }
      void client.invalidateQueries({ queryKey: tokenKeys.balance });
      void client.invalidateQueries({ queryKey: storyKeys.tokenBalance });
      // 열린 회차 목록이 `GET /me` 의 story 에 있어서 그걸 먼저 받아야 본문 요청이 풀린다.
      await client.refetchQueries({ queryKey: aiSeasonKeys.status });
      void client.invalidateQueries({ queryKey: storyKeys.content(order) });
      onUnlocked();
    },
    onError: (error, payWith) => {
      const latest = getInsufficientTokenBalance(error);
      if (latest !== null) {
        // 응답의 잔액은 낸 쪽(소금빵 또는 식빵) 것이다.
        if (payWith === 'SALT') setBalance(latest);
        client.setQueryData<StoryTokenBalance>(storyKeys.tokenBalance, (prev) => ({
          salt: payWith === 'SALT' ? latest : (prev?.salt ?? 0),
          bread: payWith === 'BREAD' ? latest : (prev?.bread ?? 0),
        }));
      }
      // 하루 대기는 서버가 정한다. 안내를 다시 그리도록 진행 상태를 새로 받는다.
      if (getStoryErrorCode(error) === 'EPISODE_COOLDOWN') {
        void client.invalidateQueries({ queryKey: aiSeasonKeys.status });
      }
    },
  });
  return { balance, unlock };
}
