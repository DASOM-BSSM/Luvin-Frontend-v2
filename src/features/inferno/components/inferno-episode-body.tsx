/**
 * [DRAFT] 회차 본문 재생(inferno-episode-screen.tsx 가 시즌을 받은 뒤 띄운다).
 *
 * - 선택: `POST .../choices` 응답 블록을 선택 블록 뒤에 끼워서 이어 재생한다(use-episode-choice).
 * - 완료: 마지막 블록 뒤 "에피소드 끝내기"에서 `POST .../complete`(use-episode-requests).
 * - 이미 완료한 회차(`completed: true`)는 다시 보기 — 선택은 이미 한 결과로 보여준다.
 */
import { router } from 'expo-router';
import { useState } from 'react';

import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import InfernoBlockPlayer from '@/src/features/inferno/components/inferno-block-player';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeStateView from '@/src/features/inferno/components/inferno-episode-state-view';
import InfernoEpisodeDoneModal from '@/src/features/inferno/components/inferno-episode-done-modal';
import InfernoSeasonReportScreen from '@/src/features/inferno/components/inferno-season-report-screen';
import useEpisodeContent from '@/src/features/inferno/hooks/use-episode-content';
import useEpisodeRequests from '@/src/features/inferno/hooks/use-episode-requests';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useInfernoBlockFlow from '@/src/features/inferno/hooks/use-inferno-block-flow';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { useSceneSeasonStore } from '@/src/features/inferno/store/scene-season-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { DEFAULT_BREAD_TYPE } from '@/src/features/inferno/utils/bread-type';
import { buildSceneSummary } from '@/src/features/inferno/utils/scene-summary';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';
import { castOf, playableBlocks } from '@/src/features/inferno/utils/story-playlist';

const LAST_ORDER = 10;
/** 10화 대화를 다 보고 리포트로 넘어간 자리(scene-season-store). */
const REPORT_POSITION = -1;

/** 생성은 끝났는데 재생할 블록이 하나도 없을 때. 다시 시도 버튼으로 이어진다. */
const EMPTY_EPISODE = new Error('Empty episode');

export default function InfernoEpisodeBody({
  order,
  sessionKey,
}: {
  order: number;
  sessionKey: string;
}) {
  const exit = useEpisodeExit(order);
  const myProfile = useBreadStore((state) => state.profile);
  const position = useSceneSeasonStore((state) => state.sessions[sessionKey]?.positions[order]);
  const save = useSceneSeasonStore((state) => state.save);
  const content = useEpisodeContent(order);
  const story = useStoryState();
  const choices = story.data?.choices ?? [];
  const readOnly = content.data?.completed === true;
  const blocks = playableBlocks(content.data?.blocks ?? []);
  const cast = castOf(blocks);
  const [done, setDone] = useState(false);
  const [report, setReport] = useState(position === REPORT_POSITION);
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
  const episode = findInfernoEpisode(order) ?? { order, title: '' };

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

  function handleAgeRequired() {
    router.push('/my-page/edit');
  }

  function handleCloseDone() {
    setDone(false);
  }

  if (report && story.data)
    return (
      <InfernoSeasonReportScreen
        summary={buildSceneSummary(story.data, cast)}
        mine={myProfile ?? cast.find((person) => person.isMine) ?? { type: DEFAULT_BREAD_TYPE, name: '' }}
        sessionKey={sessionKey}
        solo={story.data.route !== 'romance'}
        readOnly={readOnly}
      />
    );
  const choiceReady = block?.type === 'choice' && (Boolean(recorded) || readOnly);
  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface={block?.type === 'choice' || block?.type === 'interview' ? 'note' : 'plain'}
      skipLabel={exit.skipLabel}
      onSkipPress={handleLeavePress}
      onPreviousPress={flow.previous}
      onNextPress={flow.ready || choiceReady ? flow.next : undefined}
    >
      {!block ? (
        <InfernoEpisodeStateView
          order={order}
          isLoading={content.isPending && content.fetchStatus !== 'idle'}
          isGenerating={content.isGenerating}
          error={content.error ?? (content.data?.status === 'ready' ? EMPTY_EPISODE : null)}
          onRetry={content.retry}
          onShowReport={handleShowReport}
          onAgeRequired={handleAgeRequired}
        />
      ) : (
        <InfernoBlockPlayer
          key={`${block.id}:${flow.line}`}
          block={block}
          line={flow.line}
          cast={cast}
          choices={choices}
          recorded={recorded}
          readOnly={readOnly}
          pending={choice.isPending}
          pendingId={choice.isPending ? choice.variables.breadId : undefined}
          onDone={flow.markReady}
          onNext={flow.next}
          onSelect={handleSelect}
        />
      )}
      {choice.isError && getStoryErrorCode(choice.error) !== 'CHOICE_ALREADY_MADE' ? (
        <Text variant="body-s" className="text-center text-state-error">
          {ERROR_MESSAGES.choiceFailed}
        </Text>
      ) : null}
      <InfernoEpisodeDoneModal
        visible={done}
        isLastEpisode={order === LAST_ORDER}
        isSaving={completion.isPending}
        hasFailed={completion.isError}
        onFinishPress={handleFinishPress}
        onClose={handleCloseDone}
      />
    </InfernoEpisodeFrame>
  );
}
