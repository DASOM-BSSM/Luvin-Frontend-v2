/**
 * [DRAFT] 회차 완료. `POST .../complete` 가 다음 회차를 열고 회차 쪽지를 만든다(10화 쪽지가
 * 시즌 종료 쪽지). 응답 시즌으로 `GET /me` 캐시를 갈아끼우고 본문 캐시의 `completed` 를 켠다.
 * 이미 완료한 회차면 서버가 상태만 돌려주므로 다시 불러도 안전하다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { completeEpisode } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';
import type { EpisodeContent } from '@/src/features/inferno/types/story';

const LAST_ORDER = 10;

export default function useCompleteEpisode(order: number) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => completeEpisode(order),
    onSuccess: ({ seasonView }) => {
      client.setQueryData<AiSeasonStatusView>(aiSeasonKeys.status, (season) =>
        season
          ? {
              ...season,
              story: seasonView,
              status: order === LAST_ORDER ? COMPLETED_SEASON_STATUS : season.status,
            }
          : season,
      );
      client.setQueryData<EpisodeContent>(storyKeys.content(order), (content) =>
        content ? { ...content, completed: true } : content,
      );
      // 다음 회차 본문은 이 완료로 비로소 열린다. 전에 받은 409 를 남겨두지 않는다.
      void client.invalidateQueries({ queryKey: storyKeys.content(order + 1) });
    },
  });
}
