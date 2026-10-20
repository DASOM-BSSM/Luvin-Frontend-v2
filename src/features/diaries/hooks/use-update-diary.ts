import { useMutation } from '@tanstack/react-query';

import { updateDiary, type UpdateDiaryInput } from '@/src/features/diaries/api/diaries';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 일기 수정(작성자만). 성공하면 상세 캐시를 응답으로 덮고 목록들을 다시 불러온다. */
export default function useUpdateDiary() {
  return useMutation({
    mutationFn: (input: UpdateDiaryInput) => updateDiary(input),
    onSuccess: (diary) => {
      queryClient.setQueryData(diaryKeys.detail(diary.diaryId), diary);
      return invalidateDiaryFeeds();
    },
  });
}
