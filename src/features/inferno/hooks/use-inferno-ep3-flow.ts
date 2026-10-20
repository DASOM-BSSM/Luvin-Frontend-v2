import { useEffect, useState } from 'react';

import { submitEpisode3Result } from '@/src/features/inferno/api/ai-season';
import { GAME_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import type { EpisodeReplay } from '@/src/features/inferno/hooks/use-episode-replay';
import { useInfernoSelectionStore } from '@/src/features/inferno/store/selection-store';
import type { InfernoConversation } from '@/src/features/inferno/types';

/**
 * 지금 떠 있는 모달. 없으면 undefined.
 * `failureError` 는 미니게임 실패 결과를 서버에 보내지 못했을 때의 안내다.
 */
export type InfernoEp3Modal = 'done' | 'failureError';

/** 서버 에러를 그대로 보여주지 않는다(§11) — ep1 과 같이 재시도를 유도하는 한 가지 문구만 쓴다. */
export const EP3_SUBMIT_ERROR_MESSAGE = '결과를 보내지 못했어요. 다시 시도해주세요.';

/**
 * 이어보기 자리 중 "투표지" 를 뜻하는 값. 대화 쪽은 0..n-1 이라 겹치지 않는 큰 수로 둔다.
 * 미니게임을 이긴 뒤 투표지에서 나갔으면 다시 들어와도 게임을 다시 하지 않고 투표지로 간다.
 * 게임 도중에 나갔으면 마지막 대화 쪽으로 남겨서, 다시 들어오면 게임을 처음부터 한다.
 */
export const EP3_BALLOT_STEP = 1000;

/** 같은 결과·문구를 공유하는 두 미니게임 중 어느 쪽인지. 시안이 둘 다 "Episode 03"이다. */
export type InfernoEp3Game = 'shell' | 'cardflip';

interface InfernoEp3Flow {
  /** "잠시 나가기" 가 남길 자리. 대화 쪽 번호, 투표지면 EP3_BALLOT_STEP. */
  step: number;
  pageIndex: number;
  isGameOpen: boolean;
  isGamePromptOpen: boolean;
  /** 게임하기를 누를 때마다 둘 중 하나로 무작위로 정해진다. */
  selectedGame: InfernoEp3Game;
  /** 야바위/카드 뒤집기 성공 뒤 투표지를 보고 있는지. */
  isBallotOpen: boolean;
  /** 이미 본 회차를 다시 보는 중인지(use-episode-replay). ep1 흐름 훅의 같은 필드 참고. */
  isReplay: boolean;
  openModal?: InfernoEp3Modal;
  /** 아직 고르지 않았으면 undefined. */
  selectedId?: string;
  /**
   * 다시 보기에서 그 반죽이 미니게임 실패로 랜덤으로 정해졌는지. 결과 장면 제목을 "VOTE" 대신
   * "RANDOM" 으로 바꾸는 데 쓴다(LUV-65). 다시 보기가 아니거나 기록이 없으면 false.
   */
  isRandomMatch: boolean;
  /** 결과를 서버에 보내는 중인지. 버튼을 잠그고 문구를 바꾸는 데 쓴다(ep1 과 같다). */
  isSubmitting: boolean;
  /** 투표지 제출이 실패했을 때 보여줄 문구. 성공하거나 아직 안 눌렀으면 undefined. */
  submitError?: string;
  goPrevious?: () => void;
  goNext?: () => void;
  handlePageDone: () => void;
  handlePromptClose: () => void;
  handleGameStart: () => void;
  handleGameSuccess: () => void;
  /**
   * 미니게임 실패 쪽지의 "에피소드 끝내기". 실패 결과를 서버에 보내고, 보냈으면 true.
   * 화면은 true 일 때만 회차를 끝낸다 — 못 보냈으면 `failureError` 안내를 띄운다.
   */
  handleGameFailure: () => Promise<boolean>;
  handleModalClose: () => void;
  handleSelect: (participantId: string) => void;
  handleSubmit: () => void;
}

/**
 * ep3 게임 전 대화 두 쪽 → 야바위 → (성공 시) 투표지 → 완료까지의 순서를 관리한다.
 *
 * 실패는 흐름에 남기지 않는다. 실패 쪽지의 "에피소드 끝내기"는 바로 화면 밖(메인)으로
 * 나가는 동작이라 화면(src/app/inferno/ep3.tsx)이 직접 처리한다.
 *
 * 다시 보기(replay)에서는 미니게임을 건너뛴다(사용자 결정) — 마지막 쪽 뒤 미니게임 안내를 띄우지
 * 않고, "다음화면" 으로 이미 고른 반죽이 선택된 투표지로 바로 간다. 결과도 서버에 다시 보내지 않는다.
 */
export default function useInfernoEp3Flow(
  conversation: InfernoConversation | undefined,
  /** 이어볼 자리(use-episode-checkpoint). 처음 들어오면 0. */
  initialStep: number,
  /** 다시 보기 여부와 그때 보여줄 이미 고른 반죽(use-episode-replay). */
  replay: EpisodeReplay,
): InfernoEp3Flow {
  const resumesAtBallot = initialStep === EP3_BALLOT_STEP;
  const recordSelection = useInfernoSelectionStore((state) => state.recordSelection);
  const [rawPageIndex, setPageIndex] = useState(resumesAtBallot ? 0 : initialStep);
  const [isLastPageTyped, setIsLastPageTyped] = useState(false);
  const [isGamePromptOpen, setIsGamePromptOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<InfernoEp3Game>('shell');
  const [isBallotOpen, setIsBallotOpen] = useState(resumesAtBallot);
  const [openModal, setOpenModal] = useState<InfernoEp3Modal | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);

  const lastPageIndex = conversation ? conversation.pages.length - 1 : 0;
  // 저장된 자리가 쪽 수를 넘으면(쪽 나누기가 바뀐 경우) 마지막 쪽으로 잘라낸다.
  const pageIndex = Math.min(rawPageIndex, Math.max(lastPageIndex, 0));
  const isLastPage = pageIndex >= lastPageIndex;

  useEffect(() => {
    // 다시 보기에서는 미니게임을 건너뛰므로 안내도 띄우지 않는다.
    if (!isLastPageTyped || replay.isReplay) return;

    const timer = setTimeout(() => setIsGamePromptOpen(true), GAME_MODAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isLastPageTyped, replay.isReplay]);

  function handlePageDone() {
    if (isLastPage) setIsLastPageTyped(true);
  }

  function handlePromptClose() {
    setIsGamePromptOpen(false);
  }

  // 두 미니게임이 승패 문구·다음 동작을 그대로 공유해서 매번 무작위로 하나를 고른다.
  //
  // isLastPageTyped 를 내려 위 effect 의 자동 모달 타이머를 취소한다 — 안 그러면 "다음" 으로
  // 모달을 먼저 열고 GAME_MODAL_DELAY_MS 안에 게임을 시작했을 때, 뒤늦게 타이머가 모달을 한 번
  // 더 띄우고, 거기서 "게임하기"를 다시 누르면 게임이 새로 뽑혀 야바위가 카드 뒤집기로 바뀌었다.
  function handleGameStart() {
    setIsLastPageTyped(false);
    setIsGamePromptOpen(false);
    setSelectedGame(Math.random() < 0.5 ? 'shell' : 'cardflip');
    setIsGameOpen(true);
  }

  // 미니게임 성공 쪽지의 "투표하기". 게임 화면을 접고 투표지를 연다.
  function handleGameSuccess() {
    setIsGameOpen(false);
    setIsBallotOpen(true);
  }

  // 미니게임 실패 쪽지의 "에피소드 끝내기". 투표 없이 바로 나가지만, 실패도 서버에
  // 남겨야 랜덤 매칭(성공 쪽지 문구 "랜덤으로 상대가 정해져요")이 이뤄진다.
  //
  // 서버가 정해 준 랜덤 상대(partnerId)를 기기에 남겨 둔다 — 다시 볼 때 내 반죽과 그 반죽을
  // 나란히 보여준다(selection-store 주석 참고). 다시 보기에서는 실패 결과를 다시 보내지 않는다.
  //
  // 예전에는 보내기만 하고 결과를 기다리지 않아서, 실패해도 회차가 끝난 것으로 기록됐다. 그러면 서버는
  // 3화에 머문 채라 4화 대화를 만들지 못했다(LUV-56). 이제 서버가 받은 뒤에만 회차를 끝낸다.
  async function handleGameFailure(): Promise<boolean> {
    if (replay.isReplay) return true;
    if (isSubmitting) return false;

    const { seasonId } = replay;
    setIsSubmitting(true);

    try {
      const result = await submitEpisode3Result(false);
      if (seasonId && result.partnerId) {
        // 투표가 아니라 랜덤으로 정해졌다고 남긴다 — 다시 볼 때 제목이 "RANDOM" 이 된다(LUV-65).
        recordSelection(seasonId, 3, result.partnerId, 'random');
      }
      return true;
    } catch {
      setOpenModal('failureError');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelect(participantId: string) {
    // 다시 보기의 투표지는 이미 고른 반죽을 보여주기만 한다. 바꿀 수 없다.
    if (replay.isReplay) return;

    setSelectedId(participantId);
  }

  // 투표지의 "투표하기". ep1(use-inferno-ep1-flow)과 같은 규칙:
  // 고르지 않고 누르면 아무 일도 하지 않는다(§11, 없는 디자인을 지어내지 않는다).
  //
  // 완료 쪽지는 서버가 받았다고 확인해 준 뒤에만 연다(ep1 과 같다). 예전에는 결과를 기다리지 않고
  // 바로 열어서, 전송이 실패해도 회차가 끝난 것으로 기록됐다(LUV-56, handleGameFailure 주석 참고).
  async function handleSubmit() {
    // 다시 보기에서는 서버에 다시 보내지 않는다. 화면이 이 버튼을 "에피소드 끝내기"로 쓴다.
    if (!conversation || !selectedId || isSubmitting || replay.isReplay) return;

    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      await submitEpisode3Result(true, selectedId);
      // 다시 볼 때 "이미 고른 반죽"으로 보여주려고 기기에 남긴다(selection-store 주석 참고).
      if (replay.seasonId) {
        recordSelection(replay.seasonId, 3, selectedId);
      }
      setOpenModal('done');
    } catch {
      setSubmitError(EP3_SUBMIT_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleModalClose() {
    setOpenModal(undefined);
  }

  function showPreviousPage() {
    setIsLastPageTyped(false);
    setPageIndex(pageIndex - 1);
  }

  function showNextPage() {
    setIsLastPageTyped(false);
    setPageIndex(pageIndex + 1);
  }

  // 모달을 직접 열었으니 자동으로 열 타이머는 필요 없다(handleGameStart 주석 참고).
  function showGamePrompt() {
    setIsLastPageTyped(false);
    setIsGamePromptOpen(true);
  }

  // 다시 보기의 마지막 쪽에서 "다음화면": 미니게임 없이 투표지(이미 고른 반죽)로 바로 간다.
  function openBallot() {
    setIsLastPageTyped(false);
    setIsBallotOpen(true);
  }

  function closeGame() {
    setIsGameOpen(false);
  }

  function resolveGoPrevious() {
    // 투표지에서는 ep1 과 같이 상단 바로 더 갈 곳이 없다("투표하기"로만 이어진다).
    if (isBallotOpen) return undefined;
    if (isGameOpen) return closeGame;
    return pageIndex > 0 ? showPreviousPage : undefined;
  }

  function resolveGoNext() {
    if (isBallotOpen || isGameOpen) return undefined;
    if (!isLastPage) return showNextPage;

    return replay.isReplay ? openBallot : showGamePrompt;
  }

  return {
    step: isBallotOpen ? EP3_BALLOT_STEP : pageIndex,
    pageIndex,
    isGameOpen,
    isGamePromptOpen,
    selectedGame,
    isBallotOpen,
    isReplay: replay.isReplay,
    openModal,
    selectedId: replay.isReplay ? replay.replaySelectedId : selectedId,
    isRandomMatch: replay.isReplay && replay.replayMatchMethod === 'random',
    isSubmitting,
    submitError,
    goPrevious: resolveGoPrevious(),
    goNext: resolveGoNext(),
    handlePageDone,
    handlePromptClose,
    handleGameStart,
    handleGameSuccess,
    handleGameFailure,
    handleModalClose,
    handleSelect,
    handleSubmit,
  };
}
