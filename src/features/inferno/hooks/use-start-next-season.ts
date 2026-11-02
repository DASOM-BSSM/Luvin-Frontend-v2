import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';

import { createSeasonFromSurvey, startNextSeason } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import {
  isNoSeasonError,
  isSeasonInProgressError,
  isSurveyResultStaleError,
} from '@/src/features/inferno/utils/is-season-in-progress-error';
import queryClient from '@/src/lib/query-client';

/**
 * [DRAFT] "새로운 시즌 만들기". 10화까지 끝낸 시즌 다음 시즌을 연다.
 *
 * 회차 본문·쪽지 캐시는 회차 번호로만 나뉘어 있어서(query-keys.ts) 시즌이 바뀌면 지난 시즌 1화가
 * 새 시즌 1화로 보인다. 그래서 `ai-season` 접두사 캐시를 통째로 비우고, 기기에 남은 이어보기 자리도
 * 지운다. 진행도의 기준은 늘 `GET /me` 하나라 응답으로 캐시를 갈아끼우지 않는다(use-create-season.ts 와 같다).
 *
 * 이미 진행 중인 시즌이 있다는 409(SEASON_IN_PROGRESS)는 성공으로 본다 — 새 시즌은 이미 있다.
 * 시즌이 하나도 없다는 409(STORY_NOT_STARTED, 개발용 시즌 초기화 뒤)면 첫 시즌을 `/from-survey` 로 만든다.
 * 설문 결과가 최신이 아니라는 409(SURVEY_RESULT_STALE)면 빼고 한 번 더 보낸다 — 서버가 최신 결과를 쓴다.
 */
export default function useStartNextSeason() {
  return useMutation({
    mutationFn: async (surveyResultId: string) => {
      const clientRequestId = Crypto.randomUUID();
      try {
        await startNextSeason(surveyResultId, clientRequestId);
      } catch (error) {
        if (isSeasonInProgressError(error)) return;
        if (isNoSeasonError(error)) {
          await createSeasonFromSurvey(surveyResultId);
          return;
        }
        if (!isSurveyResultStaleError(error)) throw error;
        await startNextSeason(undefined, Crypto.randomUUID());
      }
    },
    onSuccess: async () => {
      useInfernoStore.getState().resetProgress();
      await queryClient.resetQueries({ queryKey: aiSeasonKeys.all });
    },
  });
}
