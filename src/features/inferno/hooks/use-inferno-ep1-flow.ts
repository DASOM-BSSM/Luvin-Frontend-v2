import { useEffect, useState } from 'react';

import { submitInfernoVote } from '@/src/features/inferno/api/conversation';
import { VOTE_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import type { InfernoConversation } from '@/src/features/inferno/types';

/** 지금 떠 있는 모달. 없으면 undefined. */
export type InfernoEp1Modal = 'vote' | 'done';

interface InfernoEp1Flow {
  pageIndex: number;
  /** 대화를 지나 투표지를 보고 있는지. */
  isBallotOpen: boolean;
  openModal?: InfernoEp1Modal;
  /** 아직 고르지 않았으면 undefined. */
  selectedId?: string;
  goPrevious?: () => void;
  goNext?: () => void;
  handlePageDone: () => void;
  handleModalClose: () => void;
  handleVoteStart: () => void;
  handleSelect: (participantId: string) => void;
  handleSubmit: () => void;
}

/**
 * ep1 의 진행 상태. 대화 쪽 넘기기 → 투표지 → 완료까지를 한곳에서 다룬다.
 *
 * 화면(src/app/inferno/ep1.tsx)에 두면 상태 다섯 개와 핸들러 일곱 개가 한 파일에 몰려
 * 150줄을 넘긴다(§16). 화면은 그리기만 하고 순서는 여기서 정한다.
 *
 * 투표 모달은 마지막 줄이 다 쳐지면 저절로 뜬다. 상단 바의 `다음화면 >` 로도 띄울 수 있어서
 * 타자를 다 보지 않고 넘어가려는 사람도 막히지 않는다.
 */
export default function useInfernoEp1Flow(
  conversation: InfernoConversation | undefined,
): InfernoEp1Flow {
  const [pageIndex, setPageIndex] = useState(0);
  const [isBallotOpen, setIsBallotOpen] = useState(false);
  const [openModal, setOpenModal] = useState<InfernoEp1Modal | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [isLastPageTyped, setIsLastPageTyped] = useState(false);

  const lastPageIndex = conversation ? conversation.pages.length - 1 : 0;
  const isLastPage = pageIndex >= lastPageIndex;

  useEffect(() => {
    if (!isLastPageTyped) {
      return;
    }

    const timer = setTimeout(() => setOpenModal('vote'), VOTE_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLastPageTyped]);

  function handlePageDone() {
    if (isLastPage) {
      setIsLastPageTyped(true);
    }
  }

  function handleModalClose() {
    setOpenModal(undefined);
  }

  // 모달의 "투표하기". 모달을 닫고 투표지로 넘어간다.
  function handleVoteStart() {
    setOpenModal(undefined);
    setIsBallotOpen(true);
  }

  function handleSelect(participantId: string) {
    setSelectedId(participantId);
  }

  /**
   * 투표지의 "투표하기".
   *
   * NOTE: 고르지 않고 누르면 아무 일도 하지 않는다. 시안에 비활성 버튼도 경고 문구도 없어서
   * 없는 디자인을 지어내지 않았다. 상태 디자인이 나오면 여기에 붙일 것(§11).
   */
  function handleSubmit() {
    if (!conversation || !selectedId) {
      return;
    }

    submitInfernoVote(conversation.episodeOrder, selectedId);
    setOpenModal('done');
  }

  // 쪽을 옮기면 타자가 처음부터 다시 시작하므로 "마지막 줄까지 쳤다" 도 같이 되돌린다.
  function goToPreviousPage() {
    setIsLastPageTyped(false);
    setPageIndex((index) => index - 1);
  }

  // 투표지에서 뒤로 가면 마지막 대화 쪽으로 돌아간다.
  function closeBallot() {
    setIsBallotOpen(false);
  }

  function goToNextPage() {
    setIsLastPageTyped(false);
    setPageIndex((index) => index + 1);
  }

  // 마지막 쪽에서 다음을 누르면 타자가 끝나길 기다리지 않고 투표 모달을 띄운다.
  function openVoteModal() {
    setOpenModal('vote');
  }

  function resolveGoPrevious() {
    if (isBallotOpen) {
      return closeBallot;
    }

    return pageIndex > 0 ? goToPreviousPage : undefined;
  }

  function resolveGoNext() {
    // 투표지에서는 상단 바로 더 갈 곳이 없다. 흐름은 "투표하기" 로만 이어진다.
    if (isBallotOpen) {
      return undefined;
    }

    return isLastPage ? openVoteModal : goToNextPage;
  }

  return {
    pageIndex,
    isBallotOpen,
    openModal,
    selectedId,
    goPrevious: resolveGoPrevious(),
    goNext: resolveGoNext(),
    handlePageDone,
    handleModalClose,
    handleVoteStart,
    handleSelect,
    handleSubmit,
  };
}
