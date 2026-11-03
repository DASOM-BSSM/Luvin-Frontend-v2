/**
 * [DRAFT] 1:1 장면 "나의 빵에게" 피드백(`POST .../scene-feedback`). 기존 2·4화 피드백 화면
 * (InfernoFeedbackScene)의 단계(pick → write)를 그대로 쓰고, 보내는 곳만 새 API 로 바꿨다.
 * 같은 줄에 다시 보내면 서버가 글을 바꾼다. 보낸 뒤 본문 캐시의 `feedbacks` 를 채워 복원한다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import { submitSceneFeedback } from '@/src/features/inferno/api/story';
import { storyKeys } from '@/src/features/inferno/api/query-keys';
import type { InfernoFeedbackStep } from '@/src/features/inferno/components/inferno-feedback-scene';
import type { EpisodeContent } from '@/src/features/inferno/types/story';

export const SCENE_FEEDBACK_MAX_LENGTH = 200;

export default function useSceneFeedbackFlow(order: number, blockId: string, onSubmitted: () => void) {
  const client = useQueryClient();
  const [step, setStep] = useState<InfernoFeedbackStep>('pick');
  const [selectedId, setSelectedId] = useState<string>();
  const [shownId, setShownId] = useState<string>();
  const [feedback, setFeedback] = useState('');
  const mutation = useMutation({
    mutationFn: (input: { messageId: string; text: string }) =>
      submitSceneFeedback(order, { blockId, ...input }),
    onSuccess: (_result, { messageId, text }) => {
      client.setQueryData<EpisodeContent>(storyKeys.content(order), (content) =>
        content ? { ...content, feedbacks: { ...content.feedbacks, [messageId]: text } } : content,
      );
      onSubmitted();
    },
  });

  function reset() {
    setStep('pick');
    setSelectedId(undefined);
    setShownId(undefined);
    setFeedback('');
    mutation.reset();
  }

  function handleTopicSelect(messageId: string) {
    setSelectedId(messageId);
    setShownId(undefined);
  }

  function handleTopicFind() {
    setShownId(selectedId);
    // 이미 남긴 피드백이 있으면 고쳐 쓰도록 채워 둔다.
    const saved = selectedId
      ? client.getQueryData<EpisodeContent>(storyKeys.content(order))?.feedbacks[selectedId]
      : undefined;
    setFeedback(saved ?? '');
  }

  function handleWriteStart() {
    setStep('write');
  }

  function submit() {
    const text = feedback.trim();
    if (!shownId || !text || mutation.isPending) return;
    mutation.mutate({ messageId: shownId, text: text.slice(0, SCENE_FEEDBACK_MAX_LENGTH) });
  }

  return {
    step,
    selectedId,
    shownId,
    feedback,
    reset,
    handleTopicSelect,
    handleTopicFind,
    handleWriteStart,
    handleFeedbackChange: setFeedback,
    isSubmitting: mutation.isPending,
    submitError: mutation.isError ? ERROR_MESSAGES.feedbackFailed : undefined,
    submit,
  };
}
