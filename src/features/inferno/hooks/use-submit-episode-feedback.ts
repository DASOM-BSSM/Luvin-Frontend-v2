import { useMutation } from '@tanstack/react-query';

import { submitEpisodeFeedback } from '@/src/features/inferno/api/ai-season';
import type { AiEpisodeMessagesView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import queryClient from '@/src/lib/query-client';

interface SubmitEpisodeFeedbackInput {
  episodeNumber: number;
  messageId: string;
  content: string;
}

/**
 * "나의 빵에게" 피드백 보내기.
 *
 * 성공하면 회차 캐시의 `feedback`만 채워 넣는다 — 다시 받아오지 않는 이유는 메시지는 그대로라
 * 회차 전체를 새로 받을 필요가 없어서다. 그러면 `isFeedbackSubmitted`가 켜져 "나의 빵에게"
 * 폴더가 바로 "이미 씀" 모양으로 바뀐다.
 */
export default function useSubmitEpisodeFeedback() {
  return useMutation({
    mutationFn: ({ episodeNumber, messageId, content }: SubmitEpisodeFeedbackInput) =>
      submitEpisodeFeedback(episodeNumber, { messageId, content }),
    onSuccess: (feedback, { episodeNumber }) => {
      queryClient.setQueryData<AiEpisodeMessagesView | null>(aiSeasonKeys.episode(episodeNumber), (episode) =>
        episode ? { ...episode, feedback } : episode,
      );
    },
  });
}
