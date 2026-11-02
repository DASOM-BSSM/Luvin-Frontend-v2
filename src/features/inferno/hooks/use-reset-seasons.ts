import { useMutation } from '@tanstack/react-query';

import { resetSeasons } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { useTokenStore } from '@/src/features/luvin-hell/store/token-store';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';
import queryClient from '@/src/lib/query-client';

/**
 * [DRAFT] "시즌 초기화"(모든 빌드, 사용자 결정). 서버에서 시즌을 지운 뒤 이 기기에 남은 시즌 흔적도 비운다.
 *
 * 회차 본문·쪽지 캐시는 회차 번호로만 나뉘어 있어서(query-keys.ts) 남겨 두면 지운 시즌 회차가 다시
 * 보인다. 그래서 새 시즌 만들기(use-start-next-season)처럼 `ai-season` 접두사 캐시를 통째로 비우고 기기의
 * 이어보기 자리도 지운다. 돌려받은 토큰은 응답 잔액으로 바로 맞추고 서버 잔액도 다시 받는다.
 *
 * 초기화 뒤 `GET /me` 는 404 `SEASON_NOT_FOUND` 다. 러빈지옥 입구(홈)가 첫 시즌을 `/from-survey` 로 만든다.
 */
export default function useResetSeasons() {
  return useMutation({
    mutationFn: resetSeasons,
    onSuccess: async ({ tokenBalance }) => {
      useInfernoStore.getState().resetProgress();
      if (tokenBalance !== undefined) useTokenStore.getState().setBalance(tokenBalance);
      await queryClient.resetQueries({ queryKey: aiSeasonKeys.all });
      void queryClient.invalidateQueries({ queryKey: tokenKeys.balance });
    },
  });
}
