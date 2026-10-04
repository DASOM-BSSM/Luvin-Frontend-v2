import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getDiary } from '@/src/features/diaries/api/diaries';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryId } from '@/src/features/diaries/types';

/** 일기 상세. 공개범위상 볼 수 없으면 403 에러가 난다. */
export default function useDiary(diaryId: DiaryId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.detail(diaryId),
    queryFn: () => getDiary(diaryId),
    enabled: isAuthenticated,
  });
}
