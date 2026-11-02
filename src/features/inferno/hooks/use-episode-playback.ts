/**
 * [DRAFT] 회차 본문 재생 상태와 동작(inferno-episode-body.tsx 는 그리기만 한다).
 *
 * 이어보기 자리는 기기(scene-season-store)에, 선택·완료는 서버에 둔다. 10화를 마치면
 * 리포트로 넘어가고, 회차 중간부터 이어 보면 소개를 다시 띄우지 않는다.
 *
 * 생성 중에도 확정된 블록부터 재생한다(블록 단위 반환). 받은 블록을 다 보면 다음 블록을 기다리고,
 * 그사이 생성이 끝나 더 올 블록이 없으면 회차를 끝낸다. 서버가 처음부터 다시 만들면(`revision` 이 바뀜)
 * 앞서 받은 블록이 무효라 처음부터 다시 재생한다.
 */
import { useState } from 'react';

import useEpisodeSource from '@/src/features/inferno/hooks/use-episode-source';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useEpisodeRequests from '@/src/features/inferno/hooks/use-episode-requests';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import type { EpisodeGate } from '@/src/features/inferno/types/story';
import { castOf, frameSurface, playableBlocks } from '@/src/features/inferno/utils/story-playlist';
import useIntroSteps from '@/src/features/inferno/hooks/use-intro-steps';
import useLeaveAfterModals from '@/src/features/inferno/hooks/use-leave-after-modals';

const LAST_ORDER = 10;
/** 10화 대화를 다 보고 리포트로 넘어간 자리(scene-season-store). */
const REPORT_POSITION = -1;

export default function useEpisodePlayback(order: number, sessionKey: string) {
  const exit = useEpisodeExit(order);
  const leaveGuard = useLeaveAfterModals();
  const position = useSceneSeasonStore((state) => state.sessions[sessionKey]?.positions[order]);
  const save = useSceneSeasonStore((state) => state.save);
  const source = useEpisodeSource(order);
  const { story, content } = source;
  const choices = story.data?.choices ?? [];
  const readOnly = content.data?.completed === true;
  const blocks = playableBlocks(content.data?.blocks ?? []);
  const cast = castOf(blocks);
  /** 서버가 아직 블록을 만드는 중이라 뒤에 더 붙는다. 다시 보기는 늘 다 받은 상태다. */
  const hasMore = !readOnly && content.data?.status === 'generating';
  const revision = content.data?.revision;
  const [seenRevision, setSeenRevision] = useState(revision);
  const [done, setDone] = useState(false);
  const [report, setReport] = useState(position === REPORT_POSITION);
  // 회차 중간부터 이어 보면 소개를 다시 띄우지 않는다.
  const [introDone, setIntroDone] = useState(position !== undefined && position > 0);
  const intro = useIntroSteps(content.data?.stageIntro, handleIntroDone);
  const flow = useInfernoBlockFlow(
    readOnly || position === undefined || position < 0 ? 0 : position,
    blocks,
    handleBlocksEnd,
    hasMore,
  );
  const block = flow.block;

  // 서버 응답에 따라 재생 자리를 맞춘다(렌더 중 상태 조정 — 같은 컴포넌트의 상태라 바로 다시 그린다).
  // 처음부터 다시 만든 회차면 처음 블록으로 돌아간다.
  if (revision !== undefined && revision !== seenRevision) {
    setSeenRevision(revision);
    if (seenRevision !== undefined) {
      flow.goToBlock(0);
      setDone(false);
    }
  }
  // 다음 블록을 기다리는데 생성이 끝났으면 방금 본 블록이 마지막이었다. 마지막 줄로 돌아가 회차를 끝낸다.
  if (flow.waiting && content.data?.status === 'ready') {
    flow.goToEnd();
    setDone(true);
  }
  const { choice, completion, submitChoice, submitCompletion } = useEpisodeRequests({
    order,
    onChosen: handleChosen,
    onCompleted: handleCompleted,
    onChoiceRequired: handleChoiceRequired,
    reloadContent: content.retry,
  });
  const recorded =
    block?.type === 'choice'
      ? choices.find((item) => item.pointId === block.choice.pointId)
      : undefined;

  function handleBlocksEnd() {
    setDone(true);
  }

  function handleLeavePress() {
    if (!readOnly) save(sessionKey, order, flow.position);
    exit.leave();
  }

  // 투표 결과 모달의 "에피소드 나가기" — 모달이 떠 있는 상태라 먼저 내리고 나간다.
  function handleLeaveFromModal() {
    leaveGuard.leaveAfterModals(handleLeavePress);
  }

  function handleSelect(breadId: string | null) {
    if (readOnly || recorded || choice.isPending || block?.type !== 'choice') return;
    submitChoice(block.id, block.choice.pointId, breadId);
  }

  // 투표하면 선택 결과 대화(수락·거절 반응, 대체 1:1) 없이 바로 회차를 끝낸다(사용자 결정). 서버가 붙여 준
  // 결과 블록은 본문 캐시에 남지만 재생하지 않는다 — 선택은 회차의 마지막 장면이다.
  function handleChosen() {
    handleBlocksEnd();
  }

  // 이미 투표한 선택 모달의 "다음으로"도 같은 이유로 회차 끝으로 간다.
  function handleChoiceNext() {
    handleBlocksEnd();
  }

  function handleCompleted() {
    if (order === LAST_ORDER) {
      setDone(false);
      save(sessionKey, order, REPORT_POSITION);
      setReport(true);
      return;
    }
    // 종료 모달이 떠 있는 채로 나가면 iOS 에 보이지 않는 막이 남아 다음 회차 시작 화면이 눌리지 않았다.
    // 모달을 먼저 내리고 나간다(use-leave-after-modals). done 은 켜 둬서 투표 모달도 다시 뜨지 않는다.
    save(sessionKey, order, 0);
    leaveGuard.leaveAfterModals(exit.completeAndLeave);
  }

  function handleChoiceRequired() {
    setDone(false);
    flow.goToBlock(Math.max(0, blocks.findIndex((item) => item.type === 'choice')));
  }

  function handleFinishPress() {
    if (completion.isPending) return;
    // 다시 보기면 완료를 다시 보내지 않는다. 10화면 리포트로 넘어간다.
    if (readOnly) handleCompleted();
    else submitCompletion();
  }

  function handleShowReport() {
    setReport(true);
  }

  function handleRetry() {
    void content.retry();
  }

  function handleIntroDone() {
    setIntroDone(true);
  }

  function handleCloseDone() {
    setDone(false);
  }

  const choiceReady = block?.type === 'choice' && (Boolean(recorded) || readOnly);
  // 소개는 1화 무대·등장인물뿐이다. 매 회차 상황 소개 화면은 없앴다(시작 화면의 회차 이름으로 옮김).
  const showIntro = !introDone && Boolean(block) && Boolean(content.data?.stageIntro);
  const gate: EpisodeGate | null = source.showUnlock
    ? 'unlock'
    : source.showLoader
      ? 'loader'
      : showIntro
        ? 'intro'
        : null;

  return {
    exit,
    content,
    story,
    choices,
    readOnly,
    cast,
    flow,
    block,
    recorded,
    choice,
    completion,
    done,
    report,
    gate,
    isLastEpisode: order === LAST_ORDER,
    surface: frameSurface(gate !== null, block),
    // 앞을 가리는 화면이 떠 있는 동안은 본문을 넘기지 않는다.
    // 소개 화면에서는 상단 바 이전/다음이 소개 장을 넘긴다(사용자 요청 — 화면 탭과 같다).
    // 그 밖에 앞을 가리는 화면(회차 열기·생성 대기)이 떠 있는 동안은 본문을 넘기지 않는다.
    onPreviousPress:
      gate === 'intro' ? intro.previous : gate ? undefined : flow.previous,
    onNextPress:
      gate === 'intro'
        ? intro.next
        : !gate && (flow.ready || choiceReady)
          ? flow.next
          : undefined,
    introStep: intro.step,
    tokenCost: source.tokenCost,
    loaderActive: source.loaderActive,
    handleUnlocked: source.handleUnlocked,
    handleLoaderExitComplete: source.handleLoaderExitComplete,
    handleLeavePress,
    handleLeaveFromModal,
    leaving: leaveGuard.leaving,
    handleModalGone: leaveGuard.handleModalGone,
    handleSelect,
    handleChoiceNext,
    handleFinishPress,
    handleShowReport,
    handleRetry,
    handleIntroNext: intro.next,
    handleCloseDone,
  };
}
