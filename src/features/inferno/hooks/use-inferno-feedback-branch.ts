import { useState } from 'react';

import useInfernoFeedbackFlow from '@/src/features/inferno/hooks/use-inferno-feedback-flow';
import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 1:1 대화에서 "나의 빵에게" 로 빠지는 곁가지의 상태. ep4 흐름(use-inferno-ep4-flow)이 쓴다.
 *
 * ep2 흐름은 같은 상태를 자기 안에 직접 들고 있다 — 이미 동작하는 ep2 를 이번에 건드리지 않으려고
 * 따로 뺐을 뿐 하는 일은 같다. 쪽지(안내·완료)를 언제 띄우는지는 부르는 쪽이 정한다.
 *
 * 피드백은 한 회차에 한 번 쓰는 기회라 보내면 `isUsed` 가 켜진다. 화면에만 들고 있어서
 * "잠시 나가기" 로 나갔다 들어오면 다시 쓸 수 있다(ep2 와 같다, 서버에 물어볼 곳이 아직 없다).
 */
export default function useInfernoFeedbackBranch(conversation: InfernoConversation | undefined) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUsed, setIsUsed] = useState(false);
  const feedback = useInfernoFeedbackFlow(conversation);

  function open() {
    feedback.reset();
    setIsOpen(true);
  }

  function submit() {
    feedback.submit();
    setIsUsed(true);
  }

  function close() {
    setIsOpen(false);
  }

  return { isOpen, isUsed, feedback, open, submit, close };
}
