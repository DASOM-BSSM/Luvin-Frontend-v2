/**
 * [DRAFT] 회차 본문 재생 상태와 동작(inferno-episode-body.tsx 는 그리기만 한다).
 *
 * 이어보기 자리는 기기(scene-season-store)에, 선택·완료는 서버에 둔다. 10화를 마치면
 * 리포트로 넘어가고, 회차 중간부터 이어 보면 소개를 다시 띄우지 않는다.
 */
import { useState } from 'react';

import useEpisodeSource from '@/src/features/inferno/hooks/use-episode-source';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useEpisodeRequests from '@/src/features/inferno/hooks/use-episode-requests';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import type { EpisodeGate } from '@/src/features/inferno/types/story';
import { castOf, frameSurface, playableBlocks } from '@/src/features/inferno/utils/story-playlist';

const LAST_ORDER = 10;
/** 10화 대화를 다 보고 리포트로 넘어간 자리(scene-season-store). */
const REPORT_POSITION = -1;

export default function useEpisodePlayback(order: number, sessionKey: string) {
  const exit = useEpisodeExit(order);
  const position = useSceneSeasonStore((state) => state.sessions[sessionKey]?.positions[order]);
  const save = useSceneSeasonStore((state) => state.save);
  const source = useEpisodeSource(order);
  const { story, content } = source;
  const choices = story.data?.choices ?? [];
  const readOnly = content.data?.completed === true;
  const blocks = playableBlocks(content.data?.blocks ?? []);
  const cast = castOf(blocks);
  const [done, setDone] = useState(false);
  const [report, setReport] = useState(position === REPORT_POSITION);
  // 회차 중간부터 이어 보면 소개를 다시 띄우지 않는다.
  const [introDone, setIntroDone] = useState(position !== undefined && position > 0);
  const flow = useInfernoBlockFlow(
    readOnly || position === undefined || position < 0 ? 0 : position,
    blocks,
    handleBlocksEnd,
  );
  const block = flow.block;
  const { choice, completion, submitChoice, submitCompletion } = useEpisodeRequests({
    order,
    onChosen: flow.selected,
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

  function handleSelect(breadId: string | null) {
    if (readOnly || recorded || choice.isPending || block?.type !== 'choice') return;
    submitChoice(block.id, block.choice.pointId, breadId);
  }

  function handleCompleted() {
    setDone(false);
    if (order === LAST_ORDER) {
      save(sessionKey, order, REPORT_POSITION);
      setReport(true);
      return;
    }
    save(sessionKey, order, 0);
    exit.completeAndLeave();
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
  const showIntro =
    !introDone && Boolean(block) && Boolean(content.data?.stageIntro || content.data?.intro);
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
    onPreviousPress: gate ? undefined : flow.previous,
    onNextPress: !gate && (flow.ready || choiceReady) ? flow.next : undefined,
    tokenCost: source.tokenCost,
    handleUnlocked: source.handleUnlocked,
    handleLoaderExitComplete: source.handleLoaderExitComplete,
    handleLeavePress,
    handleSelect,
    handleFinishPress,
    handleShowReport,
    handleRetry,
    handleIntroDone,
    handleCloseDone,
  };
}
