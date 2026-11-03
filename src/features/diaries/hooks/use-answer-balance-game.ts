import { useMutation } from '@tanstack/react-query';

import { answerBalanceGame, type AnswerBalanceGameInput } from '@/src/features/diaries/api/balance-game';
import { balanceGameKeys } from '@/src/features/diaries/api/query-keys';
import type { BalanceGame } from '@/src/features/diaries/types';
import { isBalanceGameAlreadyAnswered } from '@/src/features/diaries/utils/errors';
import queryClient from '@/src/lib/query-client';

/**
 * 밸런스 게임 보기 고르기. 응답이 결과가 채워진 질문이라 그대로 캐시에 넣는다. 이미 고른 질문(409, 다른
 * 기기에서 고른 경우 등)이면 오늘의 질문을 다시 불러와 내가 고른 보기를 보여준다.
 */
export default function useAnswerBalanceGame() {
  return useMutation({
    mutationFn: (input: AnswerBalanceGameInput) => answerBalanceGame(input),
    onSuccess: (game) => queryClient.setQueryData<BalanceGame | null>(balanceGameKeys.today, game),
    onError: (error) => {
      if (isBalanceGameAlreadyAnswered(error)) {
        return queryClient.invalidateQueries({ queryKey: balanceGameKeys.today });
      }
    },
  });
}
