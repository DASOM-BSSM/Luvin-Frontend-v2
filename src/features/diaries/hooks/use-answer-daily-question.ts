import { useMutation } from '@tanstack/react-query';

import {
  answerDailyQuestion,
  type AnswerDailyQuestionInput,
} from '@/src/features/diaries/api/daily-question';
import { dailyQuestionKeys } from '@/src/features/diaries/api/query-keys';
import queryClient from '@/src/lib/query-client';

/**
 * 밸런스 게임 답하기. 응답 본문은 메시지뿐이라, 성공하면 오늘의 질문을 다시 불러와
 * `answered`/`selectedOptionId`/`totalCount` 를 서버 값으로 맞춘다.
 */
export default function useAnswerDailyQuestion() {
  return useMutation({
    mutationFn: (input: AnswerDailyQuestionInput) => answerDailyQuestion(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuestionKeys.today }),
  });
}
