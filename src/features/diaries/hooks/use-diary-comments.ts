import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getDiaryComments } from '@/src/features/diaries/api/diary-comments';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryId } from '@/src/features/diaries/types';

/** 일기 하나에 달린 댓글 목록. */
export default function useDiaryComments(diaryId: DiaryId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: diaryKeys.comments(diaryId),
    queryFn: () => getDiaryComments(diaryId),
    enabled: isAuthenticated,
  });
}
