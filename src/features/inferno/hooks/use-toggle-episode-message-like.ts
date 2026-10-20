import { useMutation } from '@tanstack/react-query';

import { toggleEpisodeMessageLike } from '@/src/features/inferno/api/ai-season';
import type { AiEpisodeMessagesView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import queryClient from '@/src/lib/query-client';

interface ToggleEpisodeMessageLikeInput {
  episodeNumber: number;
  messageId: string;
}

/** 회차 캐시의 하트 목록에서 한 줄을 켜거나 끈 새 목록. */
function withLike(likedMessageIds: string[] | undefined, messageId: string, liked: boolean): string[] {
  const rest = (likedMessageIds ?? []).filter((id) => id !== messageId);
  return liked ? [...rest, messageId] : rest;
}

function setEpisodeLike(episodeNumber: number, messageId: string, liked: boolean) {
  queryClient.setQueryData<AiEpisodeMessagesView | null>(aiSeasonKeys.episode(episodeNumber), (episode) =>
    episode ? { ...episode, likedMessageIds: withLike(episode.likedMessageIds, messageId, liked) } : episode,
  );
}

/**
 * ep2·ep4 1:1 대화 한 줄의 하트 켜기/끄기(서버 토글).
 *
 * 누르는 순간 회차 캐시의 `likedMessageIds` 를 먼저 바꿔서 하트가 바로 뜨고 튀어나온다 — 서버
 * 응답을 기다리면 말풍선을 눌러도 잠깐 아무 일도 없는 것처럼 보인다. 응답이 오면 서버가 준 상태로
 * 맞추고, 실패하면 누르기 전 상태로 되돌린다(하트가 다시 꺼지거나 켜지는 게 실패 표시다).
 *
 * 회차 전체를 다시 받지 않는 이유는 피드백(use-submit-episode-feedback)과 같다 — 메시지는 그대로다.
 */
export default function useToggleEpisodeMessageLike() {
  return useMutation({
    mutationFn: ({ episodeNumber, messageId }: ToggleEpisodeMessageLikeInput) =>
      toggleEpisodeMessageLike(episodeNumber, { messageId }),
    onMutate: async ({ episodeNumber, messageId }) => {
      const queryKey = aiSeasonKeys.episode(episodeNumber);
      // 진행 중인 회차 조회(생성 대기 폴링 등)가 끝나며 바꿔 둔 하트를 덮어쓰지 않게 멈춘다.
      await queryClient.cancelQueries({ queryKey });

      const wasLiked =
        queryClient.getQueryData<AiEpisodeMessagesView | null>(queryKey)?.likedMessageIds?.includes(messageId) ??
        false;
      setEpisodeLike(episodeNumber, messageId, !wasLiked);

      return { wasLiked };
    },
    onSuccess: ({ messageId, liked }, { episodeNumber }) => {
      setEpisodeLike(episodeNumber, messageId, liked);
    },
    onError: (_error, { episodeNumber, messageId }, context) => {
      if (context) {
        setEpisodeLike(episodeNumber, messageId, context.wasLiked);
      }
    },
  });
}
