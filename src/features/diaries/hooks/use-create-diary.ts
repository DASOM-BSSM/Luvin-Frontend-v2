import { useMutation } from '@tanstack/react-query';

import { createDiary } from '@/src/features/diaries/api/diaries';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import type { DiaryCreateRequest } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 일기 작성(항상 방 안에). 성공하면 상세 캐시를 바로 채우고 목록들을 다시 불러온다. */
export default function useCreateDiary() {
  return useMutation({
    mutationFn: (input: DiaryCreateRequest) => createDiary(input),
    onSuccess: (diary) => {
      queryClient.setQueryData(diaryKeys.detail(diary.diaryId), diary);
      return invalidateDiaryFeeds();
    },
  });
}
