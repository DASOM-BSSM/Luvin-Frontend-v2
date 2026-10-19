import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { listSeasons } from '@/src/features/inferno/api/ai-season';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';

/** 지난 시즌까지 포함한 시즌 목록. `GET /api/ai/seasons`. */
export default function useAiSeasonList() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: aiSeasonKeys.list,
    queryFn: listSeasons,
    enabled: isAuthenticated,
  });
}
