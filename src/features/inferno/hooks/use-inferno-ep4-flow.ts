import { useEffect, useState } from 'react';

import { VOTE_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import type { InfernoConversation } from '@/src/features/inferno/types';

/** 지금 떠 있는 모달. 없으면 undefined. */
export type InfernoEp4Modal = 'reveal' | 'rebakeConfirm' | 'done';

/** 지금 보고 있는 단계. */
export type InfernoEp4Phase = 'group' | 'personal' | 'rebakeVote' | 'rebakeChat';

interface InfernoEp4Flow {
  /**
   * "잠시 나가기" 가 남길 자리. 전체대화 쪽들이 0..그룹쪽수-1, 1:1 대화 쪽이 그 다음부터다(ep2 와
   * 같은 방식). 다시 굽기 단계는 곁가지라 따로 세지 않고 그때 보던 1:1 대화 쪽으로 친다.
   */
  step: number;
  phase: InfernoEp4Phase;
  /** group 단계에서 지금 몇 쪽인지. */
  groupPageIndex: number;
  /** personal 단계에서 지금 몇 쪽인지. */
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
  /** 투표지의 "투표하기". 고른 상대와의 새 1:1 대화로 넘어간다. */
  handleRebakeSubmit: () => void;
}

/**
 * ep4 의 진행 상태. Figma `ep4-매칭전 전체대화`(5467:4661) → `ep4-매칭`(5467:5196) →
 * `ep4-대화`(5449:1735) → `ep4-끝`(5467:5675), 그리고 1:1 대화에서 갈라져 나가는
 * `다시굽기`(5467:5418 확인 → 5467:5840 투표지 → 5467:5876 새 대화).
 *
 * ep2(use-inferno-ep2-flow, feat/LUV-27 미머지)와 뼈대는 같지만, "나의 빵에게" 피드백으로
 * 빠지는 시안이 아직 없어서 그건 걷어냈다. group → reveal 모달 → personal 로 가는 줄기는
 * ep1과 같고(마지막 줄이 다 쳐지면 저절로 다음 모달이 뜨고, 상단 바 `다음화면 >` 로도
 * 띄울 수 있다), personal 단계에서는 "다시 굽기" 폴더로 rebakeVote → rebakeChat 곁가지로
 * 빠질 수 있다. rebakeChat 도 personal 과 똑같이 마지막 줄에서 done 쪽지가 뜬다.
 *
 * 되돌아가지 못하는 경계가 두 곳이다: reveal 쪽지를 닫으면 group 으로 못 돌아가고(매칭
 * 결과를 이미 봤는데 되돌리는 건 말이 안 된다, ep1 투표지와 같은 이유), rebakeVote 에서
 * 투표하면 rebakeChat 으로만 가고 personal 로 못 돌아간다(다시 굽기는 한 회차에 한 번만
 * 쓸 수 있다 — InfernoPersonalChatSidebar 주석 참고). rebakeVote 자체는 ep1 투표지처럼
 * "이전화면" 으로 personal 로 되돌아갈 수 있다(아직 투표를 안 한 상태니까).
 *
 * group·personal 은 ep2 처럼 여러 쪽이다. 예전에는 두 단계 모두 첫 쪽만 보여주고 바로 다음
 * 쪽지가 떠서, 나머지 대화가 통째로 안 보였다(사용자 지적). 쪽 안에서는 상단 바로 앞뒤 쪽을
 * 오가고, 각 단계의 마지막 쪽까지 다 쳐져야 다음 쪽지가 뜬다. rebakeChat 은 한 쪽뿐이다.
 *
 * "잠시 나가기" 로 나갔다 들어오면 보던 쪽에서 이어 본다(사용자 결정 — 모든 회차가 이어보기).
 * 다시 굽기 도중에 나갔으면 그때 보던 1:1 대화 쪽에서 이어진다.
 */
export default function useInfernoEp4Flow(
  conversation: InfernoConversation | undefined,
  /** 이어볼 자리(use-episode-checkpoint). 처음 들어오면 0. */
  initialStep: number,
): InfernoEp4Flow {
  // 진행을 step 숫자 하나로 들고 전체대화/1:1 대화 쪽 번호는 거기서 끌어낸다(ep2 와 같은 방식).
  // 들어올 때는 쪽 수를 아직 몰라서 저장된 자리만으로는 단계를 정할 수 없기 때문이다.
  // 다시 굽기 단계(rebakeVote/rebakeChat)는 그 위에 잠깐 얹히는 곁가지라 따로 둔다.
  const [step, setStep] = useState(initialStep);
  const [rebakePhase, setRebakePhase] = useState<'rebakeVote' | 'rebakeChat' | undefined>(undefined);
  const [isLastLineTyped, setIsLastLineTyped] = useState(false);
  const [openModal, setOpenModal] = useState<InfernoEp4Modal | undefined>(undefined);
  const [rebakeSelectedId, setRebakeSelectedId] = useState<string | undefined>(undefined);

  const groupPageCount = conversation?.pages.length ?? 0;
  const personalPageCount = conversation?.personalChatPages?.length ?? 0;
  const lastGroupIndex = Math.max(groupPageCount - 1, 0);
  /** 1:1 대화 첫 쪽의 step. */
  const personalStartStep = groupPageCount;
  /** 마지막 step. 1:1 대화의 마지막 쪽이다. */
  const lastStep = personalStartStep + Math.max(personalPageCount - 1, 0);
  // 저장된 자리가 쪽 수를 넘으면(쪽 나누기가 바뀐 경우) 마지막 자리로 잘라낸다.
  const safeStep = Math.min(step, lastStep);
  const isInGroupPhase = safeStep < personalStartStep;
  const groupPageIndex = isInGroupPhase ? safeStep : lastGroupIndex;
  const personalPageIndex = isInGroupPhase ? 0 : safeStep - personalStartStep;
  const phase: InfernoEp4Phase = rebakePhase ?? (isInGroupPhase ? 'group' : 'personal');

  const isLastGroupPage = groupPageIndex >= lastGroupIndex;
  const isLastPersonalPage = !isInGroupPhase && safeStep >= lastStep;
  /** 지금 단계의 마지막 쪽인지. 마지막 쪽이어야 다음 쪽지로 넘어간다. */
  const isLastPageOfPhase =
    phase === 'group' ? isLastGroupPage : phase === 'personal' ? isLastPersonalPage : true;

  useEffect(() => {
    // rebakeVote 는 줄이 쳐지는 화면이 아니다. personal 단계에서 다 쳐진 뒤(대기 중인
    // 타이머가 있는 상태) "다시 굽기" 로 넘어와도, phase 가 바뀌었으니 이 효과가 다시 돌면서
    // 여기서 걸러진다 — handleRebakeStart 가 isLastLineTyped 를 되돌려도 이 가드가 이중으로
    // 막아 준다. 마지막 쪽이 아니면 쪽지 대신 상단 바로 다음 쪽을 넘긴다.
    if (!isLastLineTyped || phase === 'rebakeVote' || !isLastPageOfPhase) {
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
    setRebakePhase('rebakeVote');
    setRebakeSelectedId(undefined);
    // personal 단계에서 이미 다 쳐진 채로 넘어왔을 수 있어서, 남아 있던 done 타이머가
    // 뒤늦게 뜨지 않도록 되돌린다(위 useEffect 가드도 같은 이유).
    setIsLastLineTyped(false);
  }

  function handleRebakeSelect(participantId: string) {
    setRebakeSelectedId(participantId);
  }

  // NOTE: 고르지 않고 누르면 아무 일도 하지 않는다. 시안에 비활성 버튼도 경고 문구도
  // 없어서 없는 디자인을 지어내지 않았다(ep1 투표지와 같은 이유).
  function handleRebakeSubmit() {
    if (!rebakeSelectedId) {
      return;
    }

    setRebakePhase('rebakeChat');
    setIsLastLineTyped(false);
  }

  function goToPersonal() {
    setRebakePhase(undefined);
  }

  // 쪽이 바뀌면 새 쪽을 처음부터 다시 친다. 이전 쪽에서 걸린 쪽지 타이머가 남지 않게 되돌린다.
  // 전체대화·1:1 대화 모두 눕혀 놓은 step 하나를 앞뒤로 옮기는 것뿐이라 함수 하나로 충분하다.
  function moveStep(offset: number) {
    return () => {
      setIsLastLineTyped(false);
      setStep(safeStep + offset);
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

    // 아직 투표하지 않았으니 personal 로 돌아갈 수 있다.
    return phase === 'rebakeVote' ? goToPersonal : undefined;
  }

  function resolveGoNext() {
    if (openModal || phase === 'rebakeVote') {
      return undefined;
    }

    // 대화를 다 보지 않아도 다음 쪽/다음 쪽지로 곧장 넘어갈 수 있다(ep2 와 같은 지름길).
    if (phase === 'group') {
      return isLastGroupPage ? openModalNow('reveal') : moveStep(1);
    }

    if (phase === 'personal') {
      return isLastPersonalPage ? openModalNow('done') : moveStep(1);
    }

    return openModalNow('done');
  }

  return {
    step: safeStep,
    phase,
    groupPageIndex,
    personalPageIndex,
    openModal,
    rebakeSelectedId,
    goPrevious: resolveGoPrevious(),
    goNext: resolveGoNext(),
    handleLineDone,
    handleModalClose,
    handleRevealAction,
    handleRebakeOpen,
    handleRebakeStart,
    handleRebakeSelect,
    handleRebakeSubmit,
  };
}
