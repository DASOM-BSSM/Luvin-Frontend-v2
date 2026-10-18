import { router } from 'expo-router';

import { leaveInferno } from '@/src/features/inferno/lib/leave-inferno';
import InfernoCardFlipScene from '@/src/features/inferno/components/inferno-cardflip-scene';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchScene from '@/src/features/inferno/components/inferno-final-match-scene';
import InfernoEpisodeStatus from '@/src/features/inferno/components/inferno-episode-status';
import InfernoMiniGameScene from '@/src/features/inferno/components/inferno-minigame-scene';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoVoteScene from '@/src/features/inferno/components/inferno-vote-scene';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useEpisodeCheckpoint from '@/src/features/inferno/hooks/use-episode-checkpoint';
import useEpisodeReplay from '@/src/features/inferno/hooks/use-episode-replay';
import useGenerationLoader from '@/src/features/inferno/hooks/use-generation-loader';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoEp3Flow, { EP3_SUBMIT_ERROR_MESSAGE } from '@/src/features/inferno/hooks/use-inferno-ep3-flow';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

const EPISODE_ORDER = 3;

/** 투표 완료 모달. ep1(src/app/inferno/ep1.tsx) 의 "ep1-끝" 모달과 같은 구성. */
const DONE_MODAL_TITLE = 'NOTICE';
const DONE_MODAL_MESSAGE = '미니게임 투표가 완료되었어요!';
const DONE_MODAL_ACTION = '에피소드 끝내기';
const DONE_MODAL_WIDTH = 'min-w-[344px]';
/** 미니게임 실패 결과를 못 보냈을 때의 안내 버튼. 시안이 없어 임시 문구다. */
const FAILURE_RETRY_LABEL = '다시 시도';
const FAILURE_RETRYING_LABEL = '보내는 중...';

export default function InfernoEp3Screen() {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);

  const episode = findInfernoEpisode(EPISODE_ORDER);
  const { conversation, isLoading, isError, hasGenerationFailed, retryGeneration } =
    useInfernoConversation(EPISODE_ORDER);
  // 대화가 와도 줄넘기 로더가 퇴장을 마칠 때까지는 대기 화면을 유지한다(use-generation-loader 주석 참고).
  const generationLoader = useGenerationLoader(isLoading);
  // 이미 투표한 회차를 다시 보는지. 다시 보기면 미니게임 없이 이미 고른 반죽을 보여준다.
  const replay = useEpisodeReplay(EPISODE_ORDER);
  // 지난번에 "잠시 나가기" 로 나갔다면 그 자리에서 이어 본다. 처음 들어오는 회차면 0.
  const checkpoint = useEpisodeCheckpoint(EPISODE_ORDER);
  const flow = useInfernoEp3Flow(conversation, checkpoint.initialStep, replay);

  // 완료 쪽지를 먼저 닫는다 — RN `Modal` 은 화면과 따로 맨 위에 뜨는 창이라, 닫지 않고 나가면
  // 세로로 돌아가는 동안 쪽지만 남아 보인다(LandscapeOnly 로도 가려지지 않는다, ep4 와 같은 이유).
  function finishEpisode() {
    flow.handleModalClose();
    completeEpisode(EPISODE_ORDER);
    void leaveInferno();
  }

  // 미니게임 실패 쪽지의 "에피소드 끝내기". 투표 없이 나가지만 실패 결과는 서버에 남겨야
  // 한다(ep3 흐름 훅 주석 참고).
  //
  // 서버가 받았을 때만 회차를 끝낸다 — 못 보냈으면 흐름 훅이 안내(failureError)를 띄우고 이 화면에
  // 남는다. 그대로 끝내면 서버는 3화에 머물러 4화 대화를 만들지 못한다(LUV-56).
  async function handleGameFailureExit() {
    const isSent = await flow.handleGameFailure();
    if (isSent) {
      finishEpisode();
    }
  }

  // "잠시 나가기" 는 스킵과 다르다. 회차를 본 것으로 치지 않고, 보던 자리만 기억해 둔다.
  function handleExitPress() {
    checkpoint.saveStep(flow.step);
    void leaveInferno();
  }

  // AI가 아직 대화를 안 만들었거나 실패했으면 빈 화면 대신 안내를 보여준다(§11, ep1/ep2 와
  // 같은 이유).
  if (!episode || !conversation || !conversation.vote || generationLoader.isShowing) {
    return (
      <InfernoEpisodeFrame episode={episode ?? { order: EPISODE_ORDER, title: '' }} surface="plain" skipLabel="잠시 나가기" onSkipPress={handleExitPress}>
        <InfernoEpisodeStatus
          isError={isError}
          isLoading={isLoading}
          hasGenerationFailed={hasGenerationFailed}
          onRetry={retryGeneration}
          isLoaderShowing={generationLoader.isShowing}
          onLoaderExitComplete={generationLoader.handleExitComplete}
        />
      </InfernoEpisodeFrame>
    );
  }

  const page = conversation.pages[flow.pageIndex];
  const voteOptions = conversation.participants.filter(({ isMine }) => !isMine);
  const myParticipant = conversation.participants.find(({ isMine }) => isMine);
  const isNoteSurface = flow.isGameOpen || flow.isBallotOpen;

  function resolvePreviousPress() {
    if (flow.goPrevious) return flow.goPrevious;
    // 투표지에서는 ep1 과 같이 더 갈 곳이 없다(버튼이 흐려지고 눌리지 않는다).
    if (flow.isBallotOpen) return undefined;

    return () => router.dismissTo(infernoIntroHref(EPISODE_ORDER));
  }

  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface={isNoteSurface ? 'note' : 'plain'}
      titleVariant={isNoteSurface ? 'text' : 'image'}
      skipLabel="잠시 나가기"
      onPreviousPress={resolvePreviousPress()}
      // 다시 보기의 투표 결과 장면에서는 "다음화면" 이 회차를 끝낸다.
      onNextPress={flow.isReplay && flow.isBallotOpen ? finishEpisode : flow.goNext}
      onSkipPress={handleExitPress}
    >
      {flow.isBallotOpen ? (
        flow.isReplay ? (
          // 다시 보기: 투표지 대신 내 반죽과 내가 투표한 반죽(미니게임 실패였으면 랜덤으로 정해진 반죽)을 나란히 보여준다(사용자 요청,
          // ep5 최종 매칭 장면을 "VOTE" 제목으로). 회차를 끝내는 건 상단 바 "다음화면" 이다.
          // 참가자 목록에는 늘 내 분신(REPRESENTATIVE)이 있다. 없으면 데이터가 어긋난 경우라 그리지 않는다.
          myParticipant ? (
            <InfernoFinalMatchScene
              title="VOTE"
              mine={myParticipant}
              partner={conversation.participants.find(({ id }) => id === flow.selectedId)}
            />
          ) : null
        ) : (
          <InfernoVoteScene
            message={conversation.vote.ballotMessage}
            options={voteOptions}
            selectedId={flow.selectedId}
            onSelect={flow.handleSelect}
            onSubmit={flow.handleSubmit}
            isSubmitting={flow.isSubmitting}
            errorMessage={flow.submitError}
          />
        )
      ) : flow.isGameOpen ? (
        flow.selectedGame === 'cardflip' ? (
          <InfernoCardFlipScene onVotePress={flow.handleGameSuccess} onExitPress={handleGameFailureExit} />
        ) : (
          <InfernoMiniGameScene onVotePress={flow.handleGameSuccess} onExitPress={handleGameFailureExit} />
        )
      ) : (
        <InfernoChatScene
          key={page.id}
          page={page}
          participants={conversation.participants}
          onPageDone={flow.handlePageDone}
        />
      )}

      <InfernoNoteModal
        visible={flow.isGamePromptOpen}
        minWidthClass="min-w-[404px]"
        title="MINI GAME"
        message={conversation.vote.modalMessage}
        actionLabel="게임하기"
        onActionPress={flow.handleGameStart}
        onClose={flow.handlePromptClose}
      />
      <InfernoNoteModal
        visible={flow.openModal === 'done'}
        minWidthClass={DONE_MODAL_WIDTH}
        title={DONE_MODAL_TITLE}
        message={DONE_MODAL_MESSAGE}
        actionLabel={DONE_MODAL_ACTION}
        onActionPress={finishEpisode}
        onClose={flow.handleModalClose}
      />
      {/* 미니게임 실패 결과를 서버에 보내지 못했을 때. "다시 시도" 로 다시 보내고, 받으면 회차를 끝낸다. */}
      <InfernoNoteModal
        visible={flow.openModal === 'failureError'}
        minWidthClass={DONE_MODAL_WIDTH}
        title={DONE_MODAL_TITLE}
        message={EP3_SUBMIT_ERROR_MESSAGE}
        actionLabel={flow.isSubmitting ? FAILURE_RETRYING_LABEL : FAILURE_RETRY_LABEL}
        onActionPress={handleGameFailureExit}
        onClose={flow.handleModalClose}
      />
    </InfernoEpisodeFrame>
  );
}
