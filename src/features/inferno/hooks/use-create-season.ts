import { useMutation } from '@tanstack/react-query';

import { createSeasonFromSurvey } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import queryClient from '@/src/lib/query-client';

/**
 * 실제 "시즌 시작" action에 붙이는 훅. 설문 제출과는 별도 요청이라, AI 생성이 실패해도
 * 설문 결과 자체는 그대로 남는다(SHARED_API_CONTRACT.md §7) — 실패하면 이 action만
 * 다시 시도하면 된다.
 */
export default function useCreateSeason() {
  return useMutation({
    mutationFn: (surveyResultId: string) => createSeasonFromSurvey(surveyResultId),
    // 응답으로 시즌 캐시를 갈아끼우지 않고 `GET /me` 를 다시 받는다. 갈아끼우면 목 모드(진행도는 목 서버,
    // 시즌 생성은 실제 서버)에서 실제 서버의 빈 진행도가 덮여서 홈이 "진행 중인 에피소드가 없어요"로
    // 돌아갔다(사용자 지적). 진행도의 기준은 늘 `GET /me` 하나다.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiSeasonKeys.status });
    },
  });
}
