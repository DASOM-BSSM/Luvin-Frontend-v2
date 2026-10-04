import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getMyDiaries } from '@/src/features/diaries/api/diaries';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';

const DEFAULT_PAGE_SIZE = 20;

/** 내가 쓴 일기 목록(최신순). page 는 0부터. */
export default function useMyDiaries(page = 0, size = DEFAULT_PAGE_SIZE) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.list(page, size),
    queryFn: () => getMyDiaries({ page, size }),
    enabled: isAuthenticated,
  });
}
