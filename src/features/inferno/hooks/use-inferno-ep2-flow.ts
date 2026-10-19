import { useEffect, useState } from 'react';

import { VOTE_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import useInfernoFeedbackFlow from '@/src/features/inferno/hooks/use-inferno-feedback-flow';
import useInfernoRebakeBranch, {
  type InfernoRebakePhase,
} from '@/src/features/inferno/hooks/use-inferno-rebake-branch';
import type { InfernoConversation } from '@/src/features/inferno/types';

/** 지금 떠 있는 모달. 없으면 undefined. */
export type InfernoEp2Modal = 'reveal' | 'done' | 'feedbackIntro' | 'feedbackDone' | 'rebakeConfirm';

/** 지금 보고 있는 단계. 매칭 결과 쪽지를 기점으로 갈리고, 피드백과 다시 굽기는 곁가지다. */
export type InfernoEp2Phase = 'group' | 'personal' | 'feedback' | InfernoRebakePhase;

/** 피드백 화면 안의 상태. 자세한 건 use-inferno-feedback-flow 참고. */
type InfernoFeedback = ReturnType<typeof useInfernoFeedbackFlow>;

interface InfernoEp2Flow {
  /**
   * 회차 안에서 지금 어디까지 왔는지. 전체대화 쪽들이 0..그룹쪽수-1, 1:1 대화 쪽이 그
   * 다음부터다. "잠시 나가기" 가 이 값을 기억해 두고, 다시 들어올 때 initialStep 으로
   * 돌아온다. 피드백은 곁가지라 따로 세지 않고, 그때 보던 1:1 대화 쪽으로 친다.
   */
  step: number;
  phase: InfernoEp2Phase;
  /** group 단계에서 지금 몇 쪽인지. 다른 단계에서는 의미 없다. */
  groupPageIndex: number;
  /** personal·rebakeChat 단계에서 지금 몇 쪽인지. 다른 단계에서는 의미 없다. */
  personalPageIndex: number;
  openModal?: InfernoEp2Modal;
  /** 다시 굽기 투표지에서 고른 상대. 아직 안 골랐으면 undefined. */
  rebakeSelectedId?: string;
  goPrevious?: () => void;
  goNext?: () => void;
  handleLineDone: () => void;
  handleModalClose: () => void;
  handleRevealAction: () => void;
  /** 1:1 대화의 "나의 빵에게". 안내 쪽지를 띄운다. */
  handleFeedbackOpen: () => void;
  /** 안내 쪽지의 "피드백하기". 피드백 화면으로 들어간다. */
  handleFeedbackStart: () => void;
  /** 피드백을 보내고 완료 쪽지를 띄운다. */
  handleFeedbackSubmit: () => void;
  /** 완료 쪽지를 닫고 1:1 대화로 돌아간다. */
  handleFeedbackDone: () => void;
  feedback: InfernoFeedback;
  /**
   * "나의 빵에게" 피드백을 이미 보냈는지. 한 회차에 한 번 쓰는 기회라, 보낸 뒤엔 폴더가
   * pink/300 으로 바뀌고 다시 눌리지 않는다(시안 `ep2-대화 끝` 5467:5564, 사용자 확인).
   *
   * 서버(회차 조회의 `feedback`)가 기억해서 "잠시 나가기" 로 나갔다 들어와도 다시 쓸 수 없다.
   */
  isFeedbackUsed: boolean;
  /** 1:1 대화의 "다시 굽기" 폴더. 확인 쪽지를 띄운다. */
  handleRebakeOpen: () => void;
  /** 확인 쪽지의 "다시 굽기 상대 고르기". 쪽지를 닫고 투표지로 넘어간다. */
  handleRebakeStart: () => void;
  handleRebakeSelect: (participantId: string) => void;
  /** 투표지의 "투표하기". 새 대화를 기다리는 단계로 넘어간다. 서버 요청은 부르는 쪽이 보낸다. */
  handleRebakeSubmit: () => void;
}

interface InfernoEp2RebakeState {
  /** 다시 굽기 뒤 새 대화가 도착했고 로더도 퇴장을 마쳤는지. 그래야 새 대화로 넘어간다. */
  isReady: boolean;
  /** 다시 굽기가 실패했는지. 실패하면 "이전화면" 으로 1:1 대화에 돌아갈 수 있다. */
  hasFailed: boolean;
}

/**
 * ep2 의 진행 상태. Figma `ep2-매칭전 전체대화`(5458:2968) → `ep2-매칭`(5467:5123) →
 * `ep2-대화`(5379:3570) → `ep2-대화 끝`(5467:5564) → `ep2-끝`(5467:5748),
 * 그리고 1:1 대화에서 갈라져 나가는 `나의 빵에게`(5467:6133, 5482:1883, 5467:6203, 5482:1923).
 *
 * ep1(use-inferno-ep1-flow)과 뼈대는 같다(줄 다 쳐짐 → 지연 뒤 모달, 마지막 쪽에서
 * "다음화면"은 모달을 곧장 연다). 다른 점은 쪽 묶음이 두 겹이라는 것 — 투표 없이 매칭
 * 결과만 보여주는 group 단계(ep1처럼 한 쪽에 말풍선 3개씩 여러 쪽)를 지나야 매칭 상대와의
 * personal 단계(쪽 여러 개)로 넘어간다. 두 겹을 `step` 숫자 하나로 눕혀 들고 있고(0..
 * 그룹쪽수-1 이 전체대화, 그 다음이 1:1 대화), phase 와 groupPageIndex/personalPageIndex 는
 * 거기서 끌어낸다 — "잠시 나가기" 가 기억한 자리와 화면이 어긋나지 않게 하려는 것이다.
 * 저장된 step 이 쪽 수보다 크면 마지막 자리로 잘라낸다.
 *
 * personal 단계로 넘어가면 되돌아가지 못한다(ep1 의 투표지가 되돌아갈 수 없는 것과 같은
 * 이유 — 매칭 결과를 이미 봤는데 되돌리는 건 말이 안 된다).
 *
 * feedback 단계는 본 줄기에서 잠깐 빠져나가는 곁가지다. 끝나면 personal 로 돌아오고,
 * 대화 진행도(step)는 건드리지 않는다. 그 안의 상태는 이 훅이 들고 있지 않고
 * use-inferno-feedback-flow 가 따로 맡는다.
 *
 * "다시 굽기" 도 곁가지다 — 투표지(rebakeVote) → 새 대화를 기다림(rebakeWaiting) → 새 대화
 * (rebakeChat). ep4 와 같은 흐름이라 그 자리는 use-inferno-rebake-branch 가 들고, ep2 시안이 따로
 * 없어서 ep4 시안을 그대로 쓴다(사용자 결정, constants/rebake). 투표하면 personal 로 못 돌아간다 —
 * 다만 서버가 실패하면 기회를 쓴 게 아니라서 "이전화면" 으로 돌아갈 수 있다.
 */
export default function useInfernoEp2Flow(
  conversation: InfernoConversation | undefined,
  /** 이어볼 자리. 처음 들어오는 회차면 0. */
  initialStep: number,
  rebake: InfernoEp2RebakeState,
): InfernoEp2Flow {
  const [step, setStep] = useState(initialStep);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLastLineTyped, setIsLastLineTyped] = useState(false);
  const [openModal, setOpenModal] = useState<InfernoEp2Modal | undefined>(undefined);

  const feedback = useInfernoFeedbackFlow(conversation, handleFeedbackSubmitted);
  // 한 회차에 한 번. 서버(회차 조회의 `feedback`)가 기억해서 나갔다 들어와도 다시 쓸 수 없다.
  const isFeedbackUsed = Boolean(conversation?.isFeedbackSubmitted);

  const groupPageCount = conversation?.pages.length ?? 0;
  const personalPageCount = conversation?.personalChatPages?.length ?? 0;
  const lastGroupIndex = Math.max(groupPageCount - 1, 0);
  /** personal 단계의 첫 쪽이 시작되는 step 값. */
  const personalStartStep = groupPageCount;
  const lastPersonalIndex = Math.max(personalPageCount - 1, 0);
  /** 마지막 단계 번호. 1:1 대화의 마지막 쪽이다. */
  const lastStep = personalStartStep + lastPersonalIndex;

  const safeStep = Math.min(step, lastStep);
  const isInGroupPhase = safeStep < personalStartStep;
  const groupPageIndex = isInGroupPhase ? Math.min(safeStep, lastGroupIndex) : lastGroupIndex;
  const rebakeBranch = useInfernoRebakeBranch({ isReady: rebake.isReady, lastPageIndex: lastPersonalIndex });
  const isRebakeChat = rebakeBranch.phase === 'rebakeChat';
  const personalPageIndex = isRebakeChat
    ? rebakeBranch.pageIndex
    : isInGroupPhase
      ? 0
      : Math.max(safeStep - personalStartStep, 0);
  const isLastGroupPage = groupPageIndex >= lastGroupIndex;
  const isLastPersonalPage = isRebakeChat ? rebakeBranch.isLastPage : !isInGroupPhase && safeStep >= lastStep;

  const phase: InfernoEp2Phase = isFeedbackOpen
    ? 'feedback'
    : (rebakeBranch.phase ?? (isInGroupPhase ? 'group' : 'personal'));

  useEffect(() => {
    if (!isLastLineTyped) {
      return;
    }

    // group 단계는 마지막 쪽에서만, personal·rebakeChat 단계도 진짜 마지막 쪽일 때만 다음 모달을 띄운다.
    const nextModal: InfernoEp2Modal | undefined =
      phase === 'group' && isLastGroupPage
        ? 'reveal'
        : (phase === 'personal' || phase === 'rebakeChat') && isLastPersonalPage
          ? 'done'
          : undefined;

    if (!nextModal) {
      return;
    }

    const timer = setTimeout(() => setOpenModal(nextModal), VOTE_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLastLineTyped, phase, isLastGroupPage, isLastPersonalPage]);

  function handleLineDone() {
    setIsLastLineTyped(true);
  }

  function handleModalClose() {
    setOpenModal(undefined);
  }

  // 매칭 결과 쪽지의 "도넛 반죽과 오븐 가기". 쪽지를 닫고 매칭 상대와의 1:1 대화로 넘어간다.
  function handleRevealAction() {
    setOpenModal(undefined);
    setStep(personalStartStep);
    setIsLastLineTyped(false);
  }

  // 대화가 다 쳐진 뒤 자동으로 뜨려던 done 쪽지보다 먼저 누를 수도 있어서, 뭐가 떠 있든
  // 확인 쪽지로 덮어 쓴다(ep4 와 같다).
  function handleRebakeOpen() {
    setOpenModal('rebakeConfirm');
  }

  function handleRebakeStart() {
    setOpenModal(undefined);
    rebakeBranch.start();
    // 이미 다 쳐진 채로 넘어왔을 수 있어서, 남아 있던 done 타이머가 뒤늦게 뜨지 않도록 되돌린다.
    setIsLastLineTyped(false);
  }

  function handleRebakeSubmit() {
    if (!rebakeBranch.submit()) {
      return;
    }

    setIsLastLineTyped(false);
  }

  function moveRebakePage(offset: number) {
    return () => {
      setIsLastLineTyped(false);
      rebakeBranch.movePage(offset);
    };
  }

  function handleFeedbackOpen() {
    setOpenModal('feedbackIntro');
  }

  function handleFeedbackStart() {
    setOpenModal(undefined);
    setIsFeedbackOpen(true);
    feedback.reset();
  }

  function handleFeedbackSubmit() {
    feedback.submit();
  }

  // 서버에 저장된 뒤에야 완료 쪽지를 띄운다. 실패하면 쓰던 화면에 남아 다시 보낼 수 있다.
  function handleFeedbackSubmitted() {
    setOpenModal('feedbackDone');
  }

  function returnToPersonalChat() {
    setOpenModal(undefined);
    setIsFeedbackOpen(false);
  }

  // group/personal 둘 다 그냥 눕혀 놓은 step 하나를 앞뒤로 옮기는 것뿐이라 쪽 이동 함수는
  // 공용이다(ep1 의 goToPreviousPage/goToNextPage 와 같은 이유).
  function goToPreviousPage() {
    setIsLastLineTyped(false);
    setStep(safeStep - 1);
  }

  function goToNextPage() {
    setIsLastLineTyped(false);
    setStep(safeStep + 1);
  }

  function openModalNow(modal: InfernoEp2Modal) {
    return () => setOpenModal(modal);
  }

  function resolveGoPrevious() {
    // 모달이 떠 있으면 상단 바로 더 갈 곳이 없다.
    if (openModal) {
      return undefined;
    }

    // 피드백은 곁가지라 "이전화면" 이 대화로 돌아가는 길이 된다.
    if (phase === 'feedback') {
      return returnToPersonalChat;
    }

    if (phase === 'rebakeChat') {
      return personalPageIndex > 0 ? moveRebakePage(-1) : undefined;
    }

    // 아직 투표하지 않았거나, 보냈는데 서버가 실패했으면 personal 로 돌아갈 수 있다.
    if (phase === 'rebakeVote' || (phase === 'rebakeWaiting' && rebake.hasFailed)) {
      return rebakeBranch.cancel;
    }

    if (phase === 'rebakeWaiting') {
      return undefined;
    }

    // 1:1 대화 첫 쪽에서는 전체대화로 되돌아가지 못한다(매칭 결과를 이미 봤는데 되돌리는
    // 건 말이 안 된다 — ep1 투표지와 같은 이유).
    if (phase === 'personal') {
      return personalPageIndex > 0 ? goToPreviousPage : undefined;
    }

    // group 단계는 ep1 처럼 여러 쪽 — 첫 쪽이 아니면 이전 쪽으로.
    return groupPageIndex > 0 ? goToPreviousPage : undefined;
  }

  function resolveGoNext() {
    if (openModal) {
      return undefined;
    }

    if (phase === 'group') {
      // 대화를 다 보지 않아도 다음 쪽/매칭 결과로 곧장 넘어갈 수 있게 한다(ep1 과 같은 지름길).
      return isLastGroupPage ? openModalNow('reveal') : goToNextPage;
    }

    // 피드백·투표지·대기 화면에서는 상단 바로 더 갈 곳이 없다. 흐름은 화면 안 버튼으로만 이어진다.
    if (phase === 'feedback' || phase === 'rebakeVote' || phase === 'rebakeWaiting') {
      return undefined;
    }

    if (phase === 'rebakeChat') {
      return isLastPersonalPage ? openModalNow('done') : moveRebakePage(1);
    }

    return isLastPersonalPage ? openModalNow('done') : goToNextPage;
  }

  return {
    // 다시 굽기 뒤의 대화를 보다가 나가면 그 쪽을 1:1 대화 자리로 남긴다.
    step: isRebakeChat ? personalStartStep + rebakeBranch.pageIndex : safeStep,
    phase,
    groupPageIndex,
    personalPageIndex,
    openModal,
    rebakeSelectedId: rebakeBranch.selectedId,
    goPrevious: resolveGoPrevious(),
    goNext: resolveGoNext(),
    handleLineDone,
    handleModalClose,
    handleRevealAction,
    handleFeedbackOpen,
    handleFeedbackStart,
    handleFeedbackSubmit,
    handleFeedbackDone: returnToPersonalChat,
    feedback,
    isFeedbackUsed,
    handleRebakeOpen,
    handleRebakeStart,
    handleRebakeSelect: rebakeBranch.select,
    handleRebakeSubmit,
  };
}
