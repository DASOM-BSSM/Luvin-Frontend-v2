/** [DRAFT] 새 10화 진행 상태. `GET /api/ai/seasons/me` 의 `story` 를 앱 내부 모양으로 읽는다. */
import { useQuery } from '@tanstack/react-query';

import { getSeasonStatus } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { mapStoryState } from '@/src/features/inferno/utils/map-story';

export default function useStoryState() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // use-ai-season-status 와 같은 캐시를 쓴다 — 선택·완료 응답으로 그 캐시를 갈아끼운다.
  return useQuery({
    queryKey: aiSeasonKeys.status,
    queryFn: getSeasonStatus,
    enabled: isAuthenticated,
    select: (season) => mapStoryState(season.story),
  });
}
