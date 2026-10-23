/**
 * [DRAFT] 회차 본문 재생(inferno-episode-screen.tsx 가 시즌을 받은 뒤 띄운다).
 *
 * - 선택: `POST .../choices` 응답 블록을 선택 블록 뒤에 끼워서 이어 재생한다(use-episode-choice).
 * - 완료: 마지막 블록 뒤 "에피소드 끝내기"에서 `POST .../complete`(use-episode-requests).
 * - 이미 완료한 회차(`completed: true`)는 다시 보기 — 선택은 이미 한 결과로 보여준다.
 */
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import InfernoBlockPlayer from '@/src/features/inferno/components/inferno-block-player';
import InfernoEpisodeIntroGate from '@/src/features/inferno/components/inferno-episode-intro-gate';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeBlocker from '@/src/features/inferno/components/inferno-episode-blocker';
import InfernoEpisodeDoneModal from '@/src/features/inferno/components/inferno-episode-done-modal';
import InfernoSeasonReportScreen from '@/src/features/inferno/components/inferno-season-report-screen';
import useEpisodePlayback from '@/src/features/inferno/hooks/use-episode-playback';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { DEFAULT_BREAD_TYPE } from '@/src/features/inferno/utils/bread-type';
import { buildSceneSummary } from '@/src/features/inferno/utils/scene-summary';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

/** 생성은 끝났는데 재생할 블록이 하나도 없을 때. 다시 시도 버튼으로 이어진다. */
const EMPTY_EPISODE = new Error('Empty episode');
/** 내 분신 정보가 아직 없을 때 리포트에 넘길 기본값. */
const FALLBACK_MINE = { type: DEFAULT_BREAD_TYPE, name: '' };

export default function InfernoEpisodeBody({
  order,
  sessionKey,
}: {
  order: number;
  sessionKey: string;
}) {
  const myProfile = useBreadStore((state) => state.profile);
  const {
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
    isLastEpisode,
    handleLeavePress,
    handleSelect,
    handleFinishPress,
    handleShowReport,
    handleRetry,
    handleIntroDone,
    handleCloseDone,
  } = useEpisodePlayback(order, sessionKey);
  const episode = findInfernoEpisode(order) ?? { order, title: '' };

  if (report && story.data)
    return (
      <InfernoSeasonReportScreen
        summary={buildSceneSummary(story.data, cast)}
        mine={myProfile ?? cast.find((person) => person.isMine) ?? FALLBACK_MINE}
        sessionKey={sessionKey}
        solo={story.data.route !== 'romance'}
        readOnly={readOnly}
      />
    );
  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface={
        showIntro || block?.type === 'choice' || block?.type === 'interview' ? 'note' : 'plain'
      }
      skipLabel={exit.skipLabel}
      onSkipPress={handleLeavePress}
      onPreviousPress={showIntro ? undefined : flow.previous}
      onNextPress={!showIntro && (flow.ready || choiceReady) ? flow.next : undefined}
    >
      {showIntro && content.data ? (
        <InfernoEpisodeIntroGate
          order={order}
          stageIntro={content.data.stageIntro}
          intro={content.data.intro}
          skippable={readOnly}
          onDone={handleIntroDone}
        />
      ) : !block ? (
        <InfernoEpisodeBlocker
          order={order}
          isLoading={content.isPending && content.fetchStatus !== 'idle'}
          isGenerating={content.isGenerating}
          error={content.error ?? (content.data?.status === 'ready' ? EMPTY_EPISODE : null)}
          onRetry={handleRetry}
          onShowReport={handleShowReport}
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
        isLastEpisode={isLastEpisode}
        isSaving={completion.isPending}
        hasFailed={completion.isError}
        onFinishPress={handleFinishPress}
        onClose={handleCloseDone}
      />
    </InfernoEpisodeFrame>
  );
}
