import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';

import { startNextSeason } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import queryClient from '@/src/lib/query-client';

/**
 * ep5 "다음 시즌 시작하기". `POST /api/ai/seasons/next`로 새 시즌을 연다.
 *
 * `clientRequestId`는 화면에 들어올 때 한 번만 만든다 — 실패 후 다시 눌러도 같은 키를
 * 보내서, 첫 요청이 사실 서버에선 성공했던 경우에도 시즌이 두 개 생기지 않는다.
 *
 * 성공하면 이전 시즌의 회차 대화/리포트 캐시와 로컬 진행도(completedOrders)를 비운다.
 * 안 그러면 새 시즌인데도 이전 시즌 대화가 보이거나, 홈이 이미 다 본 시즌으로 판단한다.
 */
export default function useStartNextSeason() {
  const [clientRequestId] = useState(() => Crypto.randomUUID());

  const mutation = useMutation({
    mutationFn: (surveyResultId: string | undefined) => startNextSeason({ surveyResultId, clientRequestId }),
    onSuccess: (status) => {
      queryClient.removeQueries({ queryKey: aiSeasonKeys.all });
      queryClient.setQueryData(aiSeasonKeys.status, status);
      useInfernoStore.getState().resetProgress();
    },
  });

  return mutation;
}
