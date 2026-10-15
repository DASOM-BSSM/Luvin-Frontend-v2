import { useEffect, useState } from 'react';

import { submitEpisode3Result } from '@/src/features/inferno/api/ai-season';
import { GAME_MODAL_DELAY_MS } from '@/src/features/inferno/constants/animation';
import type { EpisodeReplay } from '@/src/features/inferno/hooks/use-episode-replay';
import { useInfernoSelectionStore } from '@/src/features/inferno/store/selection-store';
import type { InfernoConversation } from '@/src/features/inferno/types';

/** 지금 떠 있는 모달. 없으면 undefined. */
export type InfernoEp3Modal = 'done';

/** 같은 결과·문구를 공유하는 두 미니게임 중 어느 쪽인지. 시안이 둘 다 "Episode 03"이다. */
export type InfernoEp3Game = 'shell' | 'cardflip';

interface InfernoEp3Flow {
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
  goPrevious?: () => void;
  goNext?: () => void;
  handlePageDone: () => void;
  handlePromptClose: () => void;
  handleGameStart: () => void;
  handleGameSuccess: () => void;
  /** 미니게임 실패 쪽지의 "에피소드 끝내기". 화면이 finishEpisode 전에 부른다. */
  handleGameFailure: () => void;
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
  /** 다시 보기 여부와 그때 보여줄 이미 고른 반죽(use-episode-replay). */
  replay: EpisodeReplay,
): InfernoEp3Flow {
  const recordSelection = useInfernoSelectionStore((state) => state.recordSelection);
  const [pageIndex, setPageIndex] = useState(0);
  const [isLastPageTyped, setIsLastPageTyped] = useState(false);
  const [isGamePromptOpen, setIsGamePromptOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<InfernoEp3Game>('shell');
  const [isBallotOpen, setIsBallotOpen] = useState(false);
  const [openModal, setOpenModal] = useState<InfernoEp3Modal | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const lastPageIndex = conversation ? conversation.pages.length - 1 : 0;
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
  function handleGameFailure() {
    if (replay.isReplay) return;

    const { seasonId } = replay;
    submitEpisode3Result(false)
      .then((result) => {
        if (seasonId && result.partnerId) {
          recordSelection(seasonId, 3, result.partnerId);
        }
      })
      // 기록은 다시 보기용 부가 정보라, 실패해도 회차 진행을 막지 않는다.
      .catch(() => undefined);
  }

  function handleSelect(participantId: string) {
    // 다시 보기의 투표지는 이미 고른 반죽을 보여주기만 한다. 바꿀 수 없다.
    if (replay.isReplay) return;

    setSelectedId(participantId);
  }

  // 투표지의 "투표하기". ep1(use-inferno-ep1-flow)과 같은 규칙:
  // 고르지 않고 누르면 아무 일도 하지 않는다(§11, 없는 디자인을 지어내지 않는다).
  function handleSubmit() {
    // 다시 보기에서는 서버에 다시 보내지 않는다. 화면이 이 버튼을 "에피소드 끝내기"로 쓴다.
    if (!conversation || !selectedId || replay.isReplay) return;

    submitEpisode3Result(true, selectedId);
    // 다시 볼 때 "이미 고른 반죽"으로 보여주려고 기기에 남긴다(selection-store 주석 참고).
    if (replay.seasonId) {
      recordSelection(replay.seasonId, 3, selectedId);
    }
    setOpenModal('done');
  }

  function handleModalClose() {
    setOpenModal(undefined);
  }

  function showPreviousPage() {
    setIsLastPageTyped(false);
    setPageIndex((index) => index - 1);
  }

  function showNextPage() {
    setIsLastPageTyped(false);
    setPageIndex((index) => index + 1);
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
    pageIndex,
    isGameOpen,
    isGamePromptOpen,
    selectedGame,
    isBallotOpen,
    isReplay: replay.isReplay,
    openModal,
    selectedId: replay.isReplay ? replay.replaySelectedId : selectedId,
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
