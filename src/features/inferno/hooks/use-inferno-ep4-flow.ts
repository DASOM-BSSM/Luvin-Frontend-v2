import { useEffect, useState } from 'react';

import { VOTE_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';

interface InfernoEp4Flow {
  /** 매칭 결과 쪽지가 떠 있는지. */
  isRevealOpen: boolean;
  goPrevious?: () => void;
  goNext?: () => void;
  handlePageDone: () => void;
  handleModalClose: () => void;
}

/**
 * ep4 의 진행 상태. Figma `ep4-매칭전 전체대화`(5467:4661) → `ep4-매칭`(5467:5196).
 *
 * ep1(use-inferno-ep1-flow)과 뼈대는 같지만 대화 쪽이 하나뿐이고 투표가 없어서, 쪽 넘기기와
 * 투표지 상태를 걷어내고 "마지막 줄까지 쳤는지 → 쪽지가 떴는지" 둘만 다룬다.
 *
 * 매칭 결과 쪽지는 마지막 줄이 다 쳐지면 저절로 뜬다. 상단 바의 `다음화면 >` 로도 띄울 수
 * 있어서 타자를 다 보지 않고 넘어가려는 사람도 막히지 않는다(ep1 과 같은 지름길).
 */
export default function useInfernoEp4Flow(): InfernoEp4Flow {
  const [isLastLineTyped, setIsLastLineTyped] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);

  useEffect(() => {
    if (!isLastLineTyped) {
      return;
    }

    const timer = setTimeout(() => setIsRevealOpen(true), VOTE_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLastLineTyped]);

  function handlePageDone() {
    setIsLastLineTyped(true);
  }

  function handleModalClose() {
    setIsRevealOpen(false);
  }

  function openRevealModal() {
    setIsRevealOpen(true);
  }

  return {
    isRevealOpen,
    goPrevious: undefined,
    goNext: isRevealOpen ? undefined : openRevealModal,
    handlePageDone,
    handleModalClose,
  };
}
