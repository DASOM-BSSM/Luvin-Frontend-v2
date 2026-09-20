import { router } from 'expo-router';

import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoMiniGameScene from '@/src/features/inferno/components/inferno-minigame-scene';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoVoteScene from '@/src/features/inferno/components/inferno-vote-scene';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoEp3Flow from '@/src/features/inferno/hooks/use-inferno-ep3-flow';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

const EPISODE_ORDER = 3;

/** 투표 완료 모달. ep1(src/app/inferno/ep1.tsx) 의 "ep1-끝" 모달과 같은 구성. */
const DONE_MODAL_TITLE = 'NOTICE';
const DONE_MODAL_MESSAGE = '미니게임 투표가 완료되었어요!';
const DONE_MODAL_ACTION = '에피소드 끝내기';
const DONE_MODAL_WIDTH = 'w-[344px]';

export default function InfernoEp3Screen() {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);

  const episode = findInfernoEpisode(EPISODE_ORDER);
  const { conversation } = useInfernoConversation(EPISODE_ORDER);
  const flow = useInfernoEp3Flow(conversation);

  if (!episode || !conversation) return null;

  const page = conversation.pages[flow.pageIndex];
  const voteOptions = conversation.participants.filter(({ isMine }) => !isMine);
  const isNoteSurface = flow.isGameOpen || flow.isBallotOpen;

  function finishEpisode() {
    completeEpisode(EPISODE_ORDER);
    router.dismissTo('/');
  }

  function resolvePreviousPress() {
    if (flow.goPrevious) return flow.goPrevious;
    // 투표지에서는 ep1 과 같이 더 갈 곳이 없다(버튼이 흐려지고 눌리지 않는다).
    if (flow.isBallotOpen) return undefined;

    return () => router.dismissTo(infernoIntroHref(EPISODE_ORDER));
  }

  // "잠시 나가기" 는 스킵과 다르다. 본 것으로 치지 않아서 다시 들어오면 처음부터다.
  function handleExitPress() {
    router.dismissTo('/');
  }

  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface={isNoteSurface ? 'note' : 'plain'}
      titleVariant={isNoteSurface ? 'text' : 'image'}
      skipLabel="잠시 나가기"
      onPreviousPress={resolvePreviousPress()}
      onNextPress={flow.goNext}
      onSkipPress={handleExitPress}
    >
      {flow.isBallotOpen ? (
        <InfernoVoteScene
          message={conversation.vote.ballotMessage}
          options={voteOptions}
          selectedId={flow.selectedId}
          onSelect={flow.handleSelect}
          onSubmit={flow.handleSubmit}
        />
      ) : flow.isGameOpen ? (
        <InfernoMiniGameScene onVotePress={flow.handleGameSuccess} onExitPress={finishEpisode} />
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
        widthClass="w-[404px]"
        title="MINI GAME"
        message={conversation.vote.modalMessage}
        actionLabel="게임하기"
        onActionPress={flow.handleGameStart}
        onClose={flow.handlePromptClose}
      />
      <InfernoNoteModal
        visible={flow.openModal === 'done'}
        widthClass={DONE_MODAL_WIDTH}
        title={DONE_MODAL_TITLE}
        message={DONE_MODAL_MESSAGE}
        actionLabel={DONE_MODAL_ACTION}
        onActionPress={finishEpisode}
        onClose={flow.handleModalClose}
      />
    </InfernoEpisodeFrame>
  );
}
