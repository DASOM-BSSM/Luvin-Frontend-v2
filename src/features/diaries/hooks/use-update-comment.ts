import { useMutation } from '@tanstack/react-query';

import { updateDiaryComment, type UpdateCommentInput } from '@/src/features/diaries/api/diary-comments';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 댓글 수정. 댓글 수는 그대로라 댓글 목록만 다시 불러온다. */
export default function useUpdateComment() {
  return useMutation({
    mutationFn: (input: UpdateCommentInput) => updateDiaryComment(input),
    onSuccess: (_, { diaryId }) =>
      queryClient.invalidateQueries({ queryKey: diaryKeys.comments(diaryId) }),
  });
}
