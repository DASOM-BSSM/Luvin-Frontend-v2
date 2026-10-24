/**
 * [DRAFT] 회차 본문 재생 상태와 동작(inferno-episode-body.tsx 는 그리기만 한다).
 *
 * 이어보기 자리는 기기(scene-season-store)에, 선택·완료는 서버에 둔다. 10화를 마치면
 * 리포트로 넘어가고, 회차 중간부터 이어 보면 소개를 다시 띄우지 않는다.
 */
import { useState } from 'react';

import useEpisodeContent from '@/src/features/inferno/hooks/use-episode-content';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useEpisodeRequests from '@/src/features/inferno/hooks/use-episode-requests';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';
import { castOf, playableBlocks } from '@/src/features/inferno/utils/story-playlist';

const LAST_ORDER = 10;
/** 10화 대화를 다 보고 리포트로 넘어간 자리(scene-season-store). */
const REPORT_POSITION = -1;

export default function useEpisodePlayback(order: number, sessionKey: string) {
  const exit = useEpisodeExit(order);
  const position = useSceneSeasonStore((state) => state.sessions[sessionKey]?.positions[order]);
  const save = useSceneSeasonStore((state) => state.save);
  const story = useStoryState();
  // [DRAFT] 4화 이상을 아직 열지 않았으면 본문을 요청하지 않고 회차 열기 화면부터 보여준다.
  const locked = story.data !== undefined && episodeAccess(order, story.data) === 'locked';
  const content = useEpisodeContent(order, story.data !== undefined && !locked);
  const showUnlock = locked || getStoryErrorCode(content.error) === 'EPISODE_NOT_UNLOCKED';
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

  function handleUnlocked() {
    // 409 로 막혔던 본문은 다시 요청한다. 처음부터 잠겨 있었으면 열리는 순간 알아서 요청된다.
    if (content.error) void content.retry();
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
    showIntro,
    choiceReady,
    isLastEpisode: order === LAST_ORDER,
    showUnlock,
    tokenCost: story.data?.episodeTokenCost ?? null,
    handleUnlocked,
    handleLeavePress,
    handleSelect,
    handleFinishPress,
    handleShowReport,
    handleRetry,
    handleIntroDone,
    handleCloseDone,
  };
}
