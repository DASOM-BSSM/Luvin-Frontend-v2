import { useState } from 'react';

import useInfernoFeedbackFlow from '@/src/features/inferno/hooks/use-inferno-feedback-flow';
import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 1:1 대화에서 "나의 빵에게" 로 빠지는 곁가지의 상태. ep4 흐름(use-inferno-ep4-flow)이 쓴다.
 *
 * ep2 흐름은 같은 상태를 자기 안에 직접 들고 있다 — 이미 동작하는 ep2 를 이번에 건드리지 않으려고
 * 따로 뺐을 뿐 하는 일은 같다. 쪽지(안내·완료)를 언제 띄우는지는 부르는 쪽이 정한다.
 *
 * 보내면 `isUsed` 가 켜진다. 서버(회차 조회의 `feedback`)가 기억하므로 "잠시 나가기" 로 나갔다
 * 들어와도 남는다(ep2 와 같다). 회차 한 번 제한은 앱에서 풀어서(사용자 결정) 이 값은 폴더 색(보낸 적
 * 있음)으로만 쓴다 — 보낸 뒤에도 또 누를 수 있다.
 */
export default function useInfernoFeedbackBranch(
  conversation: InfernoConversation | undefined,
  /** 서버에 저장이 끝났을 때. 완료 쪽지를 띄우는 데 쓴다. */
  onSubmitted: () => void,
) {
  const [isOpen, setIsOpen] = useState(false);
  const isUsed = Boolean(conversation?.isFeedbackSubmitted);
  const feedback = useInfernoFeedbackFlow(conversation, onSubmitted);

  function open() {
    feedback.reset();
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return { isOpen, isUsed, feedback, open, close };
}
