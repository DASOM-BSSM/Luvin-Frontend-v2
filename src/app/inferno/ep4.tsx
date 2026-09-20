import { router } from 'expo-router';

import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoEp4Flow from '@/src/features/inferno/hooks/use-inferno-ep4-flow';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

/** 이 화면이 보여주는 회차. */
const EPISODE_ORDER = 4;

/** 매칭 결과 쪽지. Figma `ep4-매칭` (5467:5196), 폭은 ep2 의 매칭 쪽지와 같은 390. */
const REVEAL_TITLE = 'NOTICE';
const REVEAL_WIDTH = 'w-[390px]';

/**
 * 러빈지옥 ep4. Figma `ep4-매칭전 전체대화`(5467:4661), `ep4-매칭`(5467:5196).
 *
 * ep2 와 뼈대가 같다(투표 없이 전체대화 한 쪽 뒤에 매칭 결과 쪽지) — 여기서는 그 뒤로 이어지는
 * 1:1 대화·피드백 화면은 아직 시안이 없어서 만들지 않는다. 매칭 결과 쪽지의
 * "도넛 반죽과 오븐 가기" 를 누르면 회차를 끝내고 오븐으로 보낸다.
 */
export default function InfernoEp4Screen() {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);

  const episode = findInfernoEpisode(EPISODE_ORDER);
  const { conversation } = useInfernoConversation(EPISODE_ORDER);
  const flow = useInfernoEp4Flow();

  // 전부 상수 목록에서 찾는 것이라 실제로는 비어 있을 수 없다. 타입을 좁히기 위한 처리.
  // API 가 붙으면 여기가 로딩·에러 자리가 된다(§11).
  if (!episode || !conversation || !conversation.matchReveal) {
    return null;
  }

  // "잠시 나가기" 는 스킵과 다르다. 본 것으로 치지 않아서 다시 들어오면 처음부터다.
  function handleExitPress() {
    router.dismissTo('/');
  }

  // 매칭 결과 쪽지의 "도넛 반죽과 오븐 가기". 회차를 끝내고 오븐으로 보낸다.
  //
  // 쪽지를 먼저 닫는 이유: 이 화면은 dismiss 가 아니라 push 로 오븐에게 자리를 넘겨서
  // 화면 자체가 언마운트되지 않는다. RN `Modal` 은 내비게이션 스택과 무관하게 항상
  // 최상단에 그려지는 네이티브 오버레이라, 닫지 않고 넘어가면 오븐 화면 위에 그대로
  // 떠 있는다.
  function handleRevealAction() {
    flow.handleModalClose();
    completeEpisode(EPISODE_ORDER);
    router.push('/oven');
  }

  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface="plain"
      skipLabel="잠시 나가기"
      onPreviousPress={flow.goPrevious}
      onNextPress={flow.goNext}
      onSkipPress={handleExitPress}
    >
      <InfernoChatScene
        page={conversation.pages[0]}
        participants={conversation.participants}
        onPageDone={flow.handlePageDone}
      />

      <InfernoNoteModal
        visible={flow.isRevealOpen}
        widthClass={REVEAL_WIDTH}
        title={REVEAL_TITLE}
        message={conversation.matchReveal.noticeMessage}
        actionLabel={conversation.matchReveal.actionLabel}
        onActionPress={handleRevealAction}
        onClose={flow.handleModalClose}
      />
    </InfernoEpisodeFrame>
  );
}
