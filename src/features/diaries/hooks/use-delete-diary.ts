import { useMutation } from '@tanstack/react-query';

import { deleteDiary } from '@/src/features/diaries/api/diaries';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryId } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 일기 삭제(작성자만). 상세 캐시를 버리고 목록들을 다시 불러온다. */
export default function useDeleteDiary() {
  return useMutation({
    mutationFn: (diaryId: DiaryId) => deleteDiary(diaryId),
    onSuccess: (_, diaryId) => {
      queryClient.removeQueries({ queryKey: diaryKeys.detail(diaryId) });
      return invalidateDiaryFeeds();
    },
  });
}
