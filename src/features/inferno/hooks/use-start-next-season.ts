import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';

import { startNextSeason } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { tokenKeys } from '@/src/features/tokens/api/query-keys';
import queryClient from '@/src/lib/query-client';

/**
 * "다음 시즌 시작하기". `POST /api/ai/seasons/next`로 새 시즌을 연다.
 *
 * 토큰 차감은 서버가 이 요청 안에서 한다고 가정한다(사용자 결정 — 백엔드 확인 전). 그래서 앱은
 * `/api/tokens/use` 를 따로 부르지 않는다. 따로 부르면 서버도 차감할 경우 토큰이 두 번 빠진다.
 * 백엔드가 "앱이 /use 를 불러야 한다"고 답하면 여기서 고친다.
 *
 * `clientRequestId`는 한 번의 "시작" 시도 동안 유지한다 — 실패 후 다시 눌러도 같은 키를
 * 보내서, 첫 요청이 사실 서버에선 성공했던 경우에도 시즌이 두 개 생기지 않는다. 성공하면 새 키로
 * 바꿔서, 같은 화면에서 다음 시즌을 또 열 때 이전 요청의 결과가 돌아오지 않게 한다.
 *
 * 성공하면 이전 시즌의 회차 대화/리포트 캐시와 로컬 진행도(completedOrders)를 비운다.
 * 안 그러면 새 시즌인데도 이전 시즌 대화가 보이거나, 홈이 이미 다 본 시즌으로 판단한다.
 */
export default function useStartNextSeason() {
  const [clientRequestId, setClientRequestId] = useState(() => Crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (surveyResultId: string | undefined) => startNextSeason({ surveyResultId, clientRequestId }),
    onSuccess: (status) => {
      queryClient.removeQueries({ queryKey: aiSeasonKeys.all });
      queryClient.setQueryData(aiSeasonKeys.status, status);
      useInfernoStore.getState().resetProgress();
      // 서버가 차감한 잔액을 다시 받는다(useTokenBalance 가 화면의 토큰 수로 동기화).
      queryClient.invalidateQueries({ queryKey: tokenKeys.balance });
      setClientRequestId(Crypto.randomUUID());
    },
  });

  return mutation;
}
