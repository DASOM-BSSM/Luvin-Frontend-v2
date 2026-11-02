/**
 * [DRAFT] 회차 완료. 1~9화는 접수만 받고 바로 끝낸다 — 서버 정리는 use-completion-watcher 가 뒤에서
 * 확인한다(사용자 요청, 저장을 기다리지 않게). 10화는 리포트가 정리 결과에 달려 있어서 끝날 때까지 기다린다.
 * `POST .../complete` 가 다음 회차를 열고 회차 쪽지를 만든다(10화 쪽지가
 * 시즌 종료 쪽지). 1~9화 쪽지는 서버가 미리 만들어 두고 이 요청에서 도착시키므로, 아직 만드는 중일 때를 위해
 * 잠시 쪽지를 기다린다(letter-wait-store). 응답 시즌으로 `GET /me` 캐시를 갈아끼우고 본문 캐시의 `completed` 를 켠다.
 * 이미 완료한 회차면 서버가 상태만 돌려주므로 다시 불러도 안전하다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { completeEpisode, requestEpisodeCompletion } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, partnerLetterKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { COMPLETED_SEASON_STATUS } from '@/src/features/inferno/constants/season';
import { useLetterWaitStore } from '@/src/features/inferno/store/letter-wait-store';
import type { EpisodeContent } from '@/src/features/inferno/types/story';

const LAST_ORDER = 10;

export default function useCompleteEpisode(order: number) {
  const client = useQueryClient();
  const startWaitingLetter = useLetterWaitStore((state) => state.startWaiting);

  return useMutation({
    mutationFn: () => (order === LAST_ORDER ? completeEpisode(order) : requestEpisodeCompletion(order)),
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
      // 회차마다 쪽지가 한 통씩 생긴다(10화 쪽지가 시즌 종료 쪽지).
      void client.invalidateQueries({ queryKey: partnerLetterKeys.unread });
      // 1~9화 쪽지는 정리를 기다리지 않고 곧 도착한다. 아직 만드는 중이면 잠시 다시 받는다.
      if (order !== LAST_ORDER) startWaitingLetter();
    },
  });
}
