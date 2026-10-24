/**
 * [DRAFT] 회차 열기. 성공하면 응답 시즌으로 `GET /me` 캐시를 갈아끼우고, 남은 토큰을 반영한 뒤
 * 회차 본문을 요청한다(보정 결정 11번). 409 `INSUFFICIENT_TOKENS` 는 화면이 안내한다.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getStoryTokenBalance, unlockEpisode } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';

export default function useUnlockEpisode(order: number, onUnlocked: () => void) {
  const client = useQueryClient();
  const setBalance = useTokenStore((state) => state.setBalance);
  const balance = useQuery({
    queryKey: storyKeys.tokenBalance,
    queryFn: getStoryTokenBalance,
  });
  const unlock = useMutation({
    mutationFn: () => unlockEpisode(order),
    onSuccess: ({ seasonView, tokenBalance }) => {
      if (seasonView)
        client.setQueryData<AiSeasonStatusView>(aiSeasonKeys.status, (season) =>
          season ? { ...season, story: seasonView } : season,
        );
      if (tokenBalance !== undefined) setBalance(tokenBalance);
      void client.invalidateQueries({ queryKey: tokenKeys.balance });
      void client.invalidateQueries({ queryKey: storyKeys.tokenBalance });
      void client.invalidateQueries({ queryKey: storyKeys.content(order) });
      onUnlocked();
    },
  });
  return { balance, unlock };
}
