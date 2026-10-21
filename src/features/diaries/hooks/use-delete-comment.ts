import { useMutation } from '@tanstack/react-query';

import { deleteDiaryComment, type DeleteCommentInput } from '@/src/features/diaries/api/diary-comments';
import { invalidateDiaryFeeds } from '@/src/features/diaries/api/invalidate';
import { diaryKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/** 댓글 삭제. 댓글 목록과, 댓글 수가 보이는 피드를 다시 불러온다. */
export default function useDeleteComment() {
  return useMutation({
    mutationFn: (input: DeleteCommentInput) => deleteDiaryComment(input),
    onSuccess: (_, { diaryId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: diaryKeys.comments(diaryId) }),
        invalidateDiaryFeeds(),
      ]),
  });
}
