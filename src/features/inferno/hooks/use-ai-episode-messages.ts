import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { getEpisodeMessages, requestEpisodeGeneration } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useAuthStore } from '@/src/features/auth/store/auth-store';

/** AI 생성이 아직 안 끝났을 때 다시 확인하는 간격. */
const GENERATION_POLL_MS = 3000;

/**
 * 회차 메시지. `messages`가 비어 있으면(아직 AI가 안 만듦) 생성을 한 번 요청하고,
 * 다 만들어질 때까지 짧게 폴링한다 — 생성 상태만 따로 조회하는 엔드포인트가 없어서
 * `GET .../episodes/{number}` 자체를 반복 호출해 확인하는 방식이다.
 */
export default function useAiEpisodeMessages(episodeNumber: number, enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRequestedGeneration = useRef(false);

  const query = useQuery({
    queryKey: aiSeasonKeys.episode(episodeNumber),
    queryFn: () => getEpisodeMessages(episodeNumber),
    enabled: isAuthenticated && enabled,
    refetchInterval: (currentQuery) =>
      currentQuery.state.data && currentQuery.state.data.messages.length === 0 ? GENERATION_POLL_MS : false,
  });

  useEffect(() => {
    if (query.data && query.data.messages.length === 0 && !hasRequestedGeneration.current) {
      hasRequestedGeneration.current = true;
      requestEpisodeGeneration(episodeNumber);
    }
  }, [query.data, episodeNumber]);

  return query;
}
