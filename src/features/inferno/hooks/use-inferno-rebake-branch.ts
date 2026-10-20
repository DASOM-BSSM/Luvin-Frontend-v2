import { useState } from 'react';

/** 다시 굽기 곁가지 안에서 보고 있는 단계. 곁가지 밖이면 undefined. */
export type InfernoRebakePhase = 'rebakeVote' | 'rebakeWaiting' | 'rebakeChat';

interface InfernoRebakeBranchOptions {
  /** 다시 굽기 뒤 새 대화가 도착했고 로더도 퇴장을 마쳤는지. 그래야 새 대화로 넘어간다. */
  isReady: boolean;
  /** 1:1 대화의 마지막 쪽 번호. 새 대화도 같은 1:1 대화 쪽들이라 이걸로 쪽을 자른다. */
  lastPageIndex: number;
}

/**
 * 1:1 대화에서 "다시 굽기" 로 빠지는 곁가지의 상태. ep2·ep4 흐름(use-inferno-ep2-flow,
 * use-inferno-ep4-flow)이 같이 쓴다. 투표지(rebakeVote) → 서버가 새 대화를 만드는 동안
 * (rebakeWaiting) → 새 대화(rebakeChat) 순서다.
 *
 * 새 대화는 서버가 회차 대화를 새 버전으로 바꿔서 personalChatPages 로 내려오므로(use-inferno-rebake),
 * rebakeChat 은 그 쪽들을 처음부터 보여준다. 쪽 번호를 흐름의 step 과 따로 세는 이유: 새 버전에서
 * 쪽 수가 달라질 수 있어서, step 에 미리 박아 두면 엉뚱한 쪽(심하면 전체대화)으로 튈 수 있다.
 *
 * 쪽지를 언제 띄우는지, 줄이 다 쳐졌는지는 부르는 흐름이 정한다. 이 훅은 곁가지의 자리만 든다.
 */
export default function useInfernoRebakeBranch({ isReady, lastPageIndex }: InfernoRebakeBranchOptions) {
  const [stage, setStage] = useState<'vote' | 'requested' | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const phase: InfernoRebakePhase | undefined =
    stage === 'vote' ? 'rebakeVote' : stage === 'requested' ? (isReady ? 'rebakeChat' : 'rebakeWaiting') : undefined;
  const safePageIndex = Math.min(pageIndex, lastPageIndex);

  /** 확인 쪽지의 "다시 굽기 상대 고르기". 투표지로 들어간다. */
  function start() {
    setStage('vote');
    setSelectedId(undefined);
  }

  function select(participantId: string) {
    setSelectedId(participantId);
  }

  /**
   * 투표지의 "투표하기". 새 대화를 기다리는 단계로 넘어간다. 고른 상대가 없으면 아무것도 하지 않고
   * false 를 돌려준다 — 시안에 비활성 버튼도 경고 문구도 없어서 없는 디자인을 지어내지 않았다
   * (ep1 투표지와 같은 이유).
   */
  function submit(): boolean {
    if (!selectedId) {
      return false;
    }

    setStage('requested');
    setPageIndex(0);
    return true;
  }

  /** 곁가지를 접고 원래 1:1 대화로 돌아간다. 아직 투표 전이거나 서버가 실패했을 때만 부른다. */
  function cancel() {
    setStage(undefined);
  }

  function movePage(offset: number) {
    setPageIndex(safePageIndex + offset);
  }

  return {
    phase,
    /** rebakeChat 에서 지금 몇 쪽인지. */
    pageIndex: safePageIndex,
    isLastPage: safePageIndex >= lastPageIndex,
    selectedId,
    start,
    select,
    submit,
    cancel,
    movePage,
  };
}
