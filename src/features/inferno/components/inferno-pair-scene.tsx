/**
 * [DRAFT] 상대가 있는 1:1 장면(`pair`). 기존 2·4화 1:1 대화 UI(InfernoPersonalChatScene)와
 * "나의 빵에게" 피드백 화면을 그대로 쓴다(보정 문서 6장).
 *
 * - 블록 하나를 한 쪽으로 보여준다. 줄이 다 쳐지면 onDone.
 * - 좋아요·피드백은 내 빵의 대사(독백 제외)에만 — utils/story-playlist 의 feedbackTargets.
 * - 남긴 상태는 본문 응답의 `likedMessageIds`·`feedbacks` 로 복원된다.
 */
import { useState } from 'react';

import InfernoFeedbackModals from '@/src/features/inferno/components/inferno-feedback-modals';
import InfernoFeedbackScene from '@/src/features/inferno/components/inferno-feedback-scene';
import InfernoPersonalChatScene from '@/src/features/inferno/components/inferno-personal-chat-scene';
import useSceneFeedbackFlow, {
  SCENE_FEEDBACK_MAX_LENGTH,
} from '@/src/features/inferno/hooks/use-scene-feedback-flow';
import useSceneLike from '@/src/features/inferno/hooks/use-scene-like';
import type { StoryBlock } from '@/src/features/inferno/types/story';
import { feedbackTargets } from '@/src/features/inferno/utils/story-playlist';

/** 대화 블록 모양(group·pair 공통). 호출하는 쪽에서 pair 이고 상대가 있을 때만 넘긴다. */
type PairBlock = Extract<StoryBlock, { type: 'group' | 'pair' }>;
type FeedbackStage = 'chat' | 'intro' | 'scene' | 'done';

interface InfernoPairSceneProps {
  order: number;
  block: PairBlock;
  likedMessageIds: string[];
  feedbacks: Record<string, string>;
  onDone: () => void;
}

export default function InfernoPairScene({
  order,
  block,
  likedMessageIds,
  feedbacks,
  onDone,
}: InfernoPairSceneProps) {
  const [stage, setStage] = useState<FeedbackStage>('chat');
  const [hasSeenAll, setHasSeenAll] = useState(false);
  const like = useSceneLike(order);
  const flow = useSceneFeedbackFlow(order, block.id, handleFeedbackSubmitted);
  const targets = feedbackTargets(block);
  const targetIds = targets.map((message) => message.id);
  const partner = block.participants.find(
    (person) => !person.isMine && block.messages.some((message) => message.participantId === person.id),
  );

  function handlePageDone() {
    setHasSeenAll(true);
    onDone();
  }

  function handleLikePress(messageId: string) {
    if (!targetIds.includes(messageId) || like.isPending) return;
    like.mutate({ blockId: block.id, messageId, liked: !likedMessageIds.includes(messageId) });
  }

  function handleFeedbackPress() {
    flow.reset();
    setStage('intro');
  }

  function handleFeedbackStart() {
    setStage('scene');
  }

  function handleFeedbackSubmitted() {
    setStage('done');
  }

  function handleBackToChat() {
    // 피드백 화면에 다녀오면 대화가 다 쳐진 상태로 다시 뜨므로 다음으로 넘길 수 있게 한다.
    // 첫 쪽지만 열었다 닫았으면 대화가 그대로 쳐지고 있으니 건드리지 않는다.
    if (stage !== 'intro' && !hasSeenAll) handlePageDone();
    setStage('chat');
  }

  if (stage === 'scene')
    return (
      <InfernoFeedbackScene
        step={flow.step}
        topics={targets.map((message) => ({ messageId: message.id, message: message.text }))}
        selectedMessageId={flow.selectedId}
        // 서버가 "이렇게 대답한 이유"를 주지 않아 이유 칸은 비워 둔다("..."). 지어내지 않는다.
        shownTopic={flow.shownId ? { messageId: flow.shownId, message: '' } : undefined}
        feedback={flow.feedback}
        onSelectTopic={flow.handleTopicSelect}
        onFindPress={flow.handleTopicFind}
        onWriteStartPress={flow.handleWriteStart}
        onFeedbackChange={flow.handleFeedbackChange}
        onSubmitPress={flow.submit}
        isSubmitting={flow.isSubmitting}
        errorMessage={flow.submitError}
        maxLength={SCENE_FEEDBACK_MAX_LENGTH}
      />
    );

  return (
    <>
      <InfernoPersonalChatScene
        page={{ id: block.id, messages: block.messages }}
        participants={block.participants}
        partner={partner}
        startFullyTyped={hasSeenAll}
        onPageDone={handlePageDone}
        onFeedbackPress={targets.length > 0 ? handleFeedbackPress : undefined}
        isFeedbackUsed={targetIds.some((id) => Boolean(feedbacks[id]))}
        likedMessageIds={likedMessageIds}
        likeableMessageIds={targetIds}
        onMessageLikePress={handleLikePress}
      />
      <InfernoFeedbackModals
        isIntroVisible={stage === 'intro'}
        isDoneVisible={stage === 'done'}
        onClose={handleBackToChat}
        onFeedbackStart={handleFeedbackStart}
        onFeedbackDone={handleBackToChat}
      />
    </>
  );
}
