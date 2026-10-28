import { useMutation } from '@tanstack/react-query';

import { deleteMyRoomAnswer, type DeleteAnswerInput } from '@/src/features/diaries/api/room-questions';
import { applyQuestionUpdate } from '@/src/features/diaries/hooks/use-answer-question';

/** 그룹 질문 내 답 지우기. */
export default function useDeleteAnswer() {
  return useMutation({
    mutationFn: (input: DeleteAnswerInput) => deleteMyRoomAnswer(input),
    onSuccess: applyQuestionUpdate,
  });
}
