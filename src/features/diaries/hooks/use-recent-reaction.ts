import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRecentReactions } from '@/src/features/diaries/api/diaries';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';

/** 내 그룹들의 일기에 다른 사람이 남긴 가장 최근 반응 하나. 없으면 data 가 undefined. */
export default function useRecentReaction() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.recentReactions(),
    queryFn: getRecentReactions,
    enabled: isAuthenticated,
    select: (reactions) => reactions[0],
  });
}
