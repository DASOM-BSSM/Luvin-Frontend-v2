import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getCommunityDiaries } from '@/src/features/diaries/api/diaries';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';

/** 공유 일기(커뮤니티) 피드 — 모든 사용자의 PUBLIC 일기, 최대 50개. */
export default function useCommunityDiaries() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.community(),
    queryFn: getCommunityDiaries,
    enabled: isAuthenticated,
  });
}
