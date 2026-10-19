import { useEffect, useState } from 'react';

import { VOTE_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import useInfernoFeedbackBranch from '@/src/features/inferno/hooks/use-inferno-feedback-branch';
import useInfernoRebakeBranch from '@/src/features/inferno/hooks/use-inferno-rebake-branch';
import type { InfernoConversation } from '@/src/features/inferno/types';

/** 지금 떠 있는 모달. 없으면 undefined. */
export type InfernoEp4Modal = 'reveal' | 'rebakeConfirm' | 'done' | 'feedbackIntro' | 'feedbackDone';

/** 지금 보고 있는 단계. */
export type InfernoEp4Phase =
  | 'group'
  | 'personal'
  | 'rebakeVote'
  | 'rebakeWaiting'
  | 'rebakeChat'
  | 'feedback';

interface InfernoEp4Flow {
  /**
   * "잠시 나가기" 가 남길 자리. 전체대화 쪽들이 0..그룹쪽수-1, 1:1 대화 쪽이 그 다음부터다(ep2 와
   * 같은 방식). 다시 굽기 단계는 곁가지라 따로 세지 않고 그때 보던 1:1 대화 쪽으로 친다.
   */
  step: number;
  phase: InfernoEp4Phase;
  /** group 단계에서 지금 몇 쪽인지. */
  groupPageIndex: number;
  /** personal·rebakeChat 단계에서 지금 몇 쪽인지. */
  personalPageIndex: number;
  openModal?: InfernoEp4Modal;
  /** 다시 굽기 투표지에서 고른 상대. 아직 안 골랐으면 undefined. */
  rebakeSelectedId?: string;
  goPrevious?: () => void;
  goNext?: () => void;
  handleLineDone: () => void;
  handleModalClose: () => void;
  /** 매칭 결과 쪽지의 "도넛 반죽과 오븐 가기". 쪽지를 닫고 1:1 대화로 넘어간다. */
  handleRevealAction: () => void;
  /** 1:1 대화의 "다시 굽기" 폴더. 확인 쪽지를 띄운다. */
  handleRebakeOpen: () => void;
  /** 확인 쪽지의 "다시 굽기 상대 고르기". 쪽지를 닫고 투표지로 넘어간다. */
  handleRebakeStart: () => void;
  handleRebakeSelect: (participantId: string) => void;
  /** 투표지의 "투표하기". 새 대화를 기다리는 단계로 넘어간다. 서버 요청은 부르는 쪽이 보낸다. */
  handleRebakeSubmit: () => void;
  /** 1:1 대화의 "나의 빵에게" 폴더. 안내 쪽지를 띄운다. */
  handleFeedbackOpen: () => void;
  /** 안내 쪽지의 "피드백하기". 피드백 쪽지로 넘어간다. */
  handleFeedbackStart: () => void;
  /** 피드백 쪽지의 "피드백 하기". 보내고 완료 쪽지를 띄운다. */
  handleFeedbackSubmit: () => void;
  /** 완료 쪽지를 닫고 보던 대화로 돌아간다. */
  handleFeedbackDone: () => void;
  feedback: ReturnType<typeof useInfernoFeedbackBranch>['feedback'];
  /** "나의 빵에게" 를 이미 썼는지. 폴더 색으로만 쓴다(use-inferno-feedback-branch 주석 참고). */
  isFeedbackUsed: boolean;
}

interface InfernoEp4RebakeState {
  /** 다시 굽기 뒤 새 대화가 도착했고 로더도 퇴장을 마쳤는지. 그래야 새 대화로 넘어간다. */
  isReady: boolean;
  /** 다시 굽기가 실패했는지. 실패하면 "이전화면" 으로 1:1 대화에 돌아갈 수 있다. */
  hasFailed: boolean;
}

/**
 * ep4 의 진행 상태. Figma `ep4-매칭전 전체대화`(5467:4661) → `ep4-매칭`(5467:5196) →
 * `ep4-대화`(5449:1735) → `ep4-끝`(5467:5675), 그리고 1:1 대화에서 갈라져 나가는
 * `다시굽기`(5467:5418 확인 → 5467:5840 투표지 → 5467:5876 새 대화).
 *
 * ep2(use-inferno-ep2-flow)와 뼈대는 같다. group → reveal 모달 → personal 로 가는 줄기는
 * ep1과 같고(마지막 줄이 다 쳐지면 저절로 다음 모달이 뜨고, 상단 바 `다음화면 >` 로도
 * 띄울 수 있다), personal 단계에서는 "다시 굽기" 폴더로 rebakeVote → rebakeWaiting →
 * rebakeChat 곁가지로 빠질 수 있다. rebakeChat 도 personal 과 똑같이 마지막 쪽에서 done 쪽지가
 * 뜬다. "나의 빵에게" 는 ep2 와 같은 피드백 쪽지로 빠졌다가 보던 대화로 돌아온다 — ep4 시안은
 * 없어서 ep2 시안을 그대로 쓴다(사용자 결정).
 *
 * rebakeWaiting 은 서버가 새 1:1 대화를 만드는 동안이다(use-inferno-rebake). 새 대화는 서버가
 * 회차 대화를 새 버전으로 바꿔서 personalChatPages 로 내려오고, rebakeChat 은 그 쪽들을 처음부터
 * 보여준다. rebakeChat 의 쪽 번호를 step 과 따로 세는 이유: 새 버전에서 쪽 수가 달라질 수 있어서,
 * step 에 미리 박아 두면 엉뚱한 쪽(심하면 전체대화)으로 튈 수 있다.
 *
 * 되돌아가지 못하는 경계가 두 곳이다: reveal 쪽지를 닫으면 group 으로 못 돌아가고(매칭
 * 결과를 이미 봤는데 되돌리는 건 말이 안 된다, ep1 투표지와 같은 이유), rebakeVote 에서
 * 투표하면 personal 로 못 돌아간다(이미 새 대화를 요청했다 — 단, 서버가 실패하면 "이전화면" 으로
 * 돌아갈 수 있다). rebakeVote 자체는 ep1 투표지처럼
 * "이전화면" 으로 personal 로 되돌아갈 수 있다(아직 투표를 안 한 상태니까).
 *
 * group·personal 은 ep2 처럼 여러 쪽이다. 예전에는 두 단계 모두 첫 쪽만 보여주고 바로 다음
 * 쪽지가 떠서, 나머지 대화가 통째로 안 보였다(사용자 지적). 쪽 안에서는 상단 바로 앞뒤 쪽을
 * 오가고, 각 단계의 마지막 쪽까지 다 쳐져야 다음 쪽지가 뜬다.
 *
 * "잠시 나가기" 로 나갔다 들어오면 보던 쪽에서 이어 본다(사용자 결정 — 모든 회차가 이어보기).
 * 다시 굽기 도중에 나갔으면 그때 보던 1:1 대화 쪽에서 이어진다.
 */
export default function useInfernoEp4Flow(
  conversation: InfernoConversation | undefined,
  /** 이어볼 자리(use-episode-checkpoint). 처음 들어오면 0. */
  initialStep: number,
  rebake: InfernoEp4RebakeState,
): InfernoEp4Flow {
  // 진행을 step 숫자 하나로 들고 전체대화/1:1 대화 쪽 번호는 거기서 끌어낸다(ep2 와 같은 방식).
  // 들어올 때는 쪽 수를 아직 몰라서 저장된 자리만으로는 단계를 정할 수 없기 때문이다.
  // 다시 굽기 단계는 그 위에 잠깐 얹히는 곁가지라 따로 둔다.
  const [step, setStep] = useState(initialStep);
  const [isLastLineTyped, setIsLastLineTyped] = useState(false);
  const [openModal, setOpenModal] = useState<InfernoEp4Modal | undefined>(undefined);
  const feedbackBranch = useInfernoFeedbackBranch(conversation, handleFeedbackSubmitted);

  const groupPageCount = conversation?.pages.length ?? 0;
  const personalPageCount = conversation?.personalChatPages?.length ?? 0;
  const lastGroupIndex = Math.max(groupPageCount - 1, 0);
  const lastPersonalIndex = Math.max(personalPageCount - 1, 0);
  /** 1:1 대화 첫 쪽의 step. */
  const personalStartStep = groupPageCount;
  /** 마지막 step. 1:1 대화의 마지막 쪽이다. */
  const lastStep = personalStartStep + lastPersonalIndex;
  // 저장된 자리가 쪽 수를 넘으면(쪽 나누기가 바뀐 경우) 마지막 자리로 잘라낸다.
  const safeStep = Math.min(step, lastStep);
  const isInGroupPhase = safeStep < personalStartStep;
  const groupPageIndex = isInGroupPhase ? safeStep : lastGroupIndex;
  // 다시 굽기 곁가지(투표지 → 대기 → 새 대화)는 ep2 와 같이 쓰는 훅이 든다(use-inferno-rebake-branch).
  const rebakeBranch = useInfernoRebakeBranch({ isReady: rebake.isReady, lastPageIndex: lastPersonalIndex });

  const basePhase: InfernoEp4Phase = isInGroupPhase ? 'group' : 'personal';
  const phase: InfernoEp4Phase = feedbackBranch.isOpen
    ? 'feedback'
    : (rebakeBranch.phase ?? basePhase);

  const isChatPhase = phase === 'personal' || phase === 'rebakeChat';
  const personalPageIndex = phase === 'rebakeChat' ? rebakeBranch.pageIndex : isInGroupPhase ? 0 : safeStep - personalStartStep;
  const isLastGroupPage = groupPageIndex >= lastGroupIndex;
  const isLastPersonalPage = personalPageIndex >= lastPersonalIndex;
  /** 지금 단계의 마지막 쪽인지. 마지막 쪽이어야 다음 쪽지로 넘어간다. */
  const isLastPageOfPhase = phase === 'group' ? isLastGroupPage : isChatPhase && isLastPersonalPage;

  useEffect(() => {
    // 쪽지는 줄이 쳐지는 대화 화면(group·personal·rebakeChat) 뒤에만 뜬다. rebakeVote·rebakeWaiting·
    // feedback 으로 넘어오면 phase 가 바뀌어 이 효과가 다시 돌면서 여기서 걸러진다 — 넘어갈 때
    // isLastLineTyped 를 되돌려도 이 가드가 이중으로 막아 준다. 마지막 쪽이 아니면 쪽지 대신 상단
    // 바로 다음 쪽을 넘긴다.
    if (!isLastLineTyped || !isLastPageOfPhase) {
      return;
    }

    // group 단계 뒤엔 매칭 결과, personal·rebakeChat 뒤엔 완료 쪽지다.
    const nextModal: InfernoEp4Modal = phase === 'group' ? 'reveal' : 'done';
    const timer = setTimeout(() => setOpenModal(nextModal), VOTE_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isLastLineTyped, phase, isLastPageOfPhase]);

  function handleLineDone() {
    setIsLastLineTyped(true);
  }

  function handleModalClose() {
    setOpenModal(undefined);
  }

  function handleRevealAction() {
    setOpenModal(undefined);
    setStep(personalStartStep);
    setIsLastLineTyped(false);
  }

  // 대화가 다 쳐진 뒤 자동으로 뜨려던 done 쪽지보다 먼저 누를 수도 있어서, 뭐가 떠 있든
  // 확인 쪽지로 덮어 쓴다.
  function handleRebakeOpen() {
    setOpenModal('rebakeConfirm');
  }

  function handleRebakeStart() {
    setOpenModal(undefined);
    rebakeBranch.start();
    // personal 단계에서 이미 다 쳐진 채로 넘어왔을 수 있어서, 남아 있던 done 타이머가
    // 뒤늦게 뜨지 않도록 되돌린다(위 useEffect 가드도 같은 이유).
    setIsLastLineTyped(false);
  }

  // NOTE: 고르지 않고 누르면 아무 일도 하지 않는다. 시안에 비활성 버튼도 경고 문구도
  // 없어서 없는 디자인을 지어내지 않았다(ep1 투표지와 같은 이유).
  function handleRebakeSubmit() {
    if (!rebakeBranch.submit()) {
      return;
    }

    setIsLastLineTyped(false);
  }

  function handleFeedbackOpen() {
    setOpenModal('feedbackIntro');
  }

  function handleFeedbackStart() {
    setOpenModal(undefined);
    // 돌아오면 대화를 처음부터 다시 친다. 이미 다 쳐졌던 표시가 남아 있으면 돌아오자마자 done
    // 쪽지가 뜬다.
    setIsLastLineTyped(false);
    feedbackBranch.open();
  }

  function handleFeedbackSubmit() {
    feedbackBranch.feedback.submit();
  }

  // 서버에 저장된 뒤에야 완료 쪽지를 띄운다. 실패하면 쓰던 화면에 남아 다시 보낼 수 있다.
  function handleFeedbackSubmitted() {
    setOpenModal('feedbackDone');
  }

  function handleFeedbackDone() {
    setOpenModal(undefined);
    feedbackBranch.close();
  }

  // 쪽이 바뀌면 새 쪽을 처음부터 다시 친다. 이전 쪽에서 걸린 쪽지 타이머가 남지 않게 되돌린다.
  // 전체대화·1:1 대화는 눕혀 놓은 step 하나를, rebakeChat 은 자기 쪽 번호를 앞뒤로 옮긴다.
  function moveStep(offset: number) {
    return () => {
      setIsLastLineTyped(false);
      setStep(safeStep + offset);
    };
  }

  function moveRebakePage(offset: number) {
    return () => {
      setIsLastLineTyped(false);
      rebakeBranch.movePage(offset);
    };
  }

  function openModalNow(modal: InfernoEp4Modal) {
    return () => setOpenModal(modal);
  }

  function resolveGoPrevious() {
    if (openModal) {
      return undefined;
    }

    if (phase === 'group') {
      return groupPageIndex > 0 ? moveStep(-1) : undefined;
    }

    // 1:1 대화 첫 쪽에서는 전체대화로 되돌아가지 못한다(매칭 결과를 이미 봤다).
    if (phase === 'personal') {
      return personalPageIndex > 0 ? moveStep(-1) : undefined;
    }

    if (phase === 'rebakeChat') {
      return personalPageIndex > 0 ? moveRebakePage(-1) : undefined;
    }

    // 피드백은 곁가지라 "이전화면" 이 보던 대화로 돌아가는 길이 된다(ep2 와 같다).
    if (phase === 'feedback') {
      return feedbackBranch.close;
    }

    // 아직 투표하지 않았거나, 보냈는데 서버가 실패했으면 personal 로 돌아갈 수 있다.
    if (phase === 'rebakeVote' || (phase === 'rebakeWaiting' && rebake.hasFailed)) {
      return rebakeBranch.cancel;
    }

    return undefined;
  }

  function resolveGoNext() {
    if (openModal) {
      return undefined;
    }

    // 대화를 다 보지 않아도 다음 쪽/다음 쪽지로 곧장 넘어갈 수 있다(ep2 와 같은 지름길).
    if (phase === 'group') {
      return isLastGroupPage ? openModalNow('reveal') : moveStep(1);
    }

    if (phase === 'personal') {
      return isLastPersonalPage ? openModalNow('done') : moveStep(1);
    }

    if (phase === 'rebakeChat') {
      return isLastPersonalPage ? openModalNow('done') : moveRebakePage(1);
    }

    // 투표지·대기·피드백 화면에서는 상단 바로 더 갈 곳이 없다. 화면 안 버튼으로만 이어진다.
    return undefined;
  }

  return {
    // 다시 굽기 뒤의 대화를 보다가 나가면 그 쪽을 1:1 대화 자리로 남긴다.
    // 피드백을 쓰다가 나가도 밑에 깔린 대화 기준으로 남긴다.
    step: rebakeBranch.phase === 'rebakeChat' ? personalStartStep + rebakeBranch.pageIndex : safeStep,
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
    handleRebakeOpen,
    handleRebakeStart,
    handleRebakeSelect: rebakeBranch.select,
    handleRebakeSubmit,
    handleFeedbackOpen,
    handleFeedbackStart,
    handleFeedbackSubmit,
    handleFeedbackDone,
    feedback: feedbackBranch.feedback,
    isFeedbackUsed: feedbackBranch.isUsed,
  };
}
