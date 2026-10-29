import { useMutation } from '@tanstack/react-query';

import { roomKeys } from '@/src/features/diaries/api/query-keys';
import { answerRoomQuestion, type AnswerQuestionInput } from '@/src/features/diaries/api/room-questions';
import type { RoomQuestion } from '@/src/features/diaries/types';
import queryClient from '@/src/lib/query-client';

/** 지금 질문이 바뀐 질문과 같으면 응답으로 바꿔 넣고, 지난 질문 목록(답 수)은 다시 불러온다. */
export function applyQuestionUpdate(question: RoomQuestion) {
  queryClient.setQueryData<RoomQuestion | null>(roomKeys.currentQuestion(question.roomId), (current) =>
    current?.questionId === question.questionId ? question : current,
  );
  return queryClient.invalidateQueries({ queryKey: roomKeys.questionHistory(question.roomId) });
}

/** 그룹 질문 답하기 · 고치기(같은 API — 다시 보내면 수정). */
export default function useAnswerQuestion() {
  return useMutation({
    mutationFn: (input: AnswerQuestionInput) => answerRoomQuestion(input),
    onSuccess: applyQuestionUpdate,
  });
}
