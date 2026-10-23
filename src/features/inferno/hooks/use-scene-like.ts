/**
 * [DRAFT] 1:1 장면 내 빵 대사 좋아요(`POST .../scene-likes`). 켜고 끄는 값을 직접 보낸다.
 * 누르자마자 본문 캐시의 `likedMessageIds` 를 바꾸고, 실패하면 되돌린다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setSceneLike } from '@/src/features/inferno/api/story';
import { storyKeys } from '@/src/features/inferno/api/query-keys';
import type { EpisodeContent } from '@/src/features/inferno/types/story';

interface LikeInput {
  blockId: string;
  messageId: string;
  liked: boolean;
}

function withLike(content: EpisodeContent | undefined, messageId: string, liked: boolean) {
  if (!content) return content;
  const others = content.likedMessageIds.filter((id) => id !== messageId);
  return { ...content, likedMessageIds: liked ? [...others, messageId] : others };
}

export default function useSceneLike(order: number) {
  const client = useQueryClient();
  const key = storyKeys.content(order);

  return useMutation({
    mutationFn: (input: LikeInput) => setSceneLike(order, input),
    onMutate: ({ messageId, liked }) => {
      client.setQueryData<EpisodeContent>(key, (content) => withLike(content, messageId, liked));
    },
    onError: (_error, { messageId, liked }) => {
      client.setQueryData<EpisodeContent>(key, (content) => withLike(content, messageId, !liked));
    },
  });
}
