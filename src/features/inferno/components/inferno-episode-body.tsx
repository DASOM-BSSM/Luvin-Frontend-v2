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
import InfernoEpisodeGateView from '@/src/features/inferno/components/inferno-episode-gate-view';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeBlocker from '@/src/features/inferno/components/inferno-episode-blocker';
import InfernoEpisodeDoneModal from '@/src/features/inferno/components/inferno-episode-done-modal';
import InfernoSeasonReportGate from '@/src/features/inferno/components/inferno-season-report-gate';
import useDoneModalGate from '@/src/features/inferno/hooks/use-done-modal-gate';
import useEpisodePlayback from '@/src/features/inferno/hooks/use-episode-playback';
import useSeasonCast from '@/src/features/inferno/hooks/use-season-cast';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { DEFAULT_BREAD_TYPE } from '@/src/features/inferno/utils/bread-type';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

/** 생성은 끝났는데 재생할 블록이 하나도 없을 때. 다시 시도 버튼으로 이어진다. */
const EMPTY_EPISODE = new Error('Empty episode');
/** 내 분신 정보가 아직 없을 때 리포트에 넘길 기본값. */
const NO_IDS: string[] = [];
const NO_FEEDBACKS: Record<string, string> = {};
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
    gate,
    isLastEpisode,
    surface,
    onPreviousPress,
    onNextPress,
    tokenCost,
    loaderActive,
    handleUnlocked,
    handleLoaderExitComplete,
    handleLeavePress,
    handleLeaveFromModal,
    leaving,
    handleModalGone,
    handleSelect,
    handleChoiceNext,
    handleFinishPress,
    handleShowReport,
    handleRetry,
    handleIntroNext,
    introStep,
    handleCloseDone,
  } = useEpisodePlayback(order, sessionKey);
  const doneGate = useDoneModalGate(done, block?.type === 'choice', handleCloseDone);
  const episode = findInfernoEpisode(order) ?? { order, title: '' };

  // 투표 모달이 닫히면: 회차가 끝났으면 종료 모달을, 나가는 중이면 나가기를 이어서 한다.
  function handleChoiceModalDismiss() {
    doneGate.handleChoiceModalDismiss();
    if (leaving) handleModalGone();
  }
  const seasonCast = useSeasonCast(sessionKey, order, content.data?.stageIntro?.cast);

  if (report && story.data)
    return (
      <InfernoSeasonReportGate
        story={story.data}
        cast={cast}
        mine={myProfile ?? cast.find((person) => person.isMine) ?? FALLBACK_MINE}
        sessionKey={sessionKey}
        readOnly={readOnly}
      />
    );
  return (
    <InfernoEpisodeFrame
      episode={episode}
      titleVariant="text"
      surface={surface}
      skipLabel={exit.skipLabel}
      onSkipPress={handleLeavePress}
      onPreviousPress={onPreviousPress}
      onNextPress={onNextPress}
    >
      {gate ? (
        <InfernoEpisodeGateView
          gate={gate}
          order={order}
          content={content.data}
          tokenCost={tokenCost}
          isGenerating={loaderActive}
          onUnlocked={handleUnlocked}
          onLoaderExitComplete={handleLoaderExitComplete}
          introStep={introStep}
          onIntroNext={handleIntroNext}
        />
      ) : !block ? (
        <InfernoEpisodeBlocker
          order={order}
          isLoading={content.isPending && content.fetchStatus !== 'idle'}
          isGenerating={content.isGenerating || flow.waiting}
          error={
            content.error ??
            (content.data?.status === 'ready' && !flow.waiting ? EMPTY_EPISODE : null)
          }
          onRetry={handleRetry}
          onShowReport={handleShowReport}
        />
      ) : (
        <InfernoBlockPlayer
          // 톡방은 줄이 바뀌어도 다시 마운트하지 않는다. 다시 마운트하면 스크롤이 맨 위로 돌아갔다가
          // 내려가서, 1:1 대화처럼 아래로 이어 내려가지 않는다(InfernoMessengerScene 이 줄마다 연출을 다시 건다).
          key={block.type === 'messenger' ? block.id : `${block.id}:${flow.line}`}
          order={order}
          block={block}
          likedMessageIds={content.data?.likedMessageIds ?? NO_IDS}
          feedbacks={content.data?.feedbacks ?? NO_FEEDBACKS}
          line={flow.line}
          cast={cast}
          stageCast={seasonCast.stageCast}
          characters={seasonCast.characters}
          choices={choices}
          recorded={recorded}
          readOnly={readOnly}
          pending={choice.isPending}
          onDone={flow.markReady}
          onNext={flow.next}
          onSelect={handleSelect}
          onChoiceNext={handleChoiceNext}
          ended={done || leaving}
          onChoiceModalDismiss={handleChoiceModalDismiss}
          onLeave={handleLeaveFromModal}
        />
      )}
      {choice.isError && getStoryErrorCode(choice.error) !== 'CHOICE_ALREADY_MADE' ? (
        <Text variant="body-s" className="text-center text-state-error">
          {ERROR_MESSAGES.choiceFailed}
        </Text>
      ) : null}
      <InfernoEpisodeDoneModal
        visible={doneGate.visible && !leaving}
        isLastEpisode={isLastEpisode}
        isSaving={completion.isPending}
        hasFailed={completion.isError}
        onFinishPress={handleFinishPress}
        onClose={doneGate.handleClose}
        onDismiss={handleModalGone}
      />
    </InfernoEpisodeFrame>
  );
}
