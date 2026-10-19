
import { leaveInferno } from '@/src/features/inferno/lib/leave-inferno';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoEp4Modals from '@/src/features/inferno/components/inferno-ep4-modals';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeStatus from '@/src/features/inferno/components/inferno-episode-status';
import InfernoFeedbackScene from '@/src/features/inferno/components/inferno-feedback-scene';
import InfernoPersonalChatScene from '@/src/features/inferno/components/inferno-personal-chat-scene';
import InfernoVoteScene from '@/src/features/inferno/components/inferno-vote-scene';
import useEpisodeCheckpoint from '@/src/features/inferno/hooks/use-episode-checkpoint';
import useEpisodeReplay from '@/src/features/inferno/hooks/use-episode-replay';
import useGenerationLoader from '@/src/features/inferno/hooks/use-generation-loader';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoEp4Flow from '@/src/features/inferno/hooks/use-inferno-ep4-flow';
import useInfernoRebake from '@/src/features/inferno/hooks/use-inferno-rebake';
import useToggleEpisodeMessageLike from '@/src/features/inferno/hooks/use-toggle-episode-message-like';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { findPersonalChatPartner } from '@/src/features/inferno/utils/personal-chat';

/** 이 화면이 보여주는 회차. */
const EPISODE_ORDER = 4;

/**
 * 러빈지옥 ep4. Figma `ep4-매칭전 전체대화`(5467:4661) → `ep4-매칭`(5467:5196) →
 * `ep4-대화`(5449:1735) → `ep4-끝`(5467:5675), 그리고 1:1 대화에서 갈라져 나가는
 * `다시굽기`(5467:5418 확인 → 5467:5840 투표지 → 5467:5876 새 대화).
 *
 * ep2와 뼈대가 같다 — 투표 없이 전체대화 한 쪽 뒤에 매칭 결과 쪽지가 뜨고, 그걸 닫으면
 * 매칭 상대와의 1:1 대화로 넘어간다. 그 대화에서 "다시 굽기" 를 누르면 남은 반죽 중 하나로
 * 투표해 새 1:1 대화로 넘어갈 수 있다. "나의 빵에게" 는 ep2 와 같은 피드백 쪽지로 빠진다 —
 * ep4 시안은 없어서 ep2 시안을 그대로 쓴다(사용자 결정).
 *
 * "다시 굽기"는 `.../rerolls` API 로 붙였다(use-inferno-rebake). 투표하면 서버가 새 1:1 대화를
 * 만드는 동안 줄넘기 로더를 띄우고, 다 오면 새 대화를 처음부터 보여준다. 못 누르는 때(다시 보기,
 * 이미 썼음, 쓴 적이 있는지 아직 모름)는 폴더가 회색이고, 다시 굽기로 고른 상대와 대화하는 동안은
 * "선택됨" 모양으로 흐려진다(InfernoPersonalChatSidebar 주석 참고).
 *
 * 진행 순서는 흐름 훅(use-inferno-ep4-flow)이 정한다.
 */
export default function InfernoEp4Screen() {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);

  const episode = findInfernoEpisode(EPISODE_ORDER);
  const { conversation, isLoading, isError, hasGenerationFailed, retryGeneration } =
    useInfernoConversation(EPISODE_ORDER);
  // 대화가 와도 줄넘기 로더가 퇴장을 마칠 때까지는 대기 화면을 유지한다(use-generation-loader 주석 참고).
  const generationLoader = useGenerationLoader(isLoading);
  // 지난번에 "잠시 나가기" 로 나갔다면 그 자리에서 이어 본다. 처음 들어오는 회차면 0.
  const checkpoint = useEpisodeCheckpoint(EPISODE_ORDER);
  // 이미 본 회차를 다시 보는지. 다시 보기면 다시 굽기(투표)를 막고 결과(최종 1:1 대화)만 보여준다.
  const replay = useEpisodeReplay(EPISODE_ORDER);
  // 1:1 대화에서 말풍선을 눌러 하트를 켜고 끈다(서버 토글).
  const toggleLike = useToggleEpisodeMessageLike();
  const rebake = useInfernoRebake(EPISODE_ORDER, conversation?.versionId, conversation?.rebake != null);
  // 새 대화가 와도 로더가 퇴장을 마칠 때까지는 대기 화면을 유지한다(위 generationLoader 와 같다).
  const rebakeLoader = useGenerationLoader(rebake.isWaiting);
  const flow = useInfernoEp4Flow(conversation, checkpoint.initialStep, {
    isReady: rebake.isReady && !rebakeLoader.isShowing,
    hasFailed: rebake.hasFailed,
  });

  // 말풍선을 누르면 그 줄의 하트를 켜고 끈다.
  function handleMessageLikePress(messageId: string) {
    toggleLike.mutate({ episodeNumber: EPISODE_ORDER, messageId });
  }

  // "잠시 나가기" 는 스킵과 다르다. 회차를 본 것으로 치지 않고, 보던 자리만 기억해 둔다.
  function handleExitPress() {
    checkpoint.saveStep(flow.step);
    void leaveInferno();
  }

  // 완료 쪽지의 "에피소드 끝내기". 회차를 끝내고 ep1~3 과 같이 홈으로 돌려보낸다.
  //
  // 쪽지를 먼저 닫는 이유: RN `Modal` 은 내비게이션 스택과 무관하게 항상 최상단에 그려지는
  // 네이티브 오버레이라, 화면이 언마운트되기 전에 닫지 않으면 다음 화면 위에 잠깐 남을 수 있다.
  function finishEpisode() {
    flow.handleModalClose();
    completeEpisode(EPISODE_ORDER);
    void leaveInferno();
  }

  // 투표지의 "투표하기". 흐름을 대기 단계로 넘기고 서버에 다시 굽기를 보낸다.
  function handleRebakeSubmit() {
    if (!flow.rebakeSelectedId) {
      return;
    }

    flow.handleRebakeSubmit();
    rebake.request(flow.rebakeSelectedId);
  }

  // rebake 가 없어도 화면은 그린다(폴더만 회색) — matchReveal/personalChatPages 만 갖추면 되고,
  // AI가 아직 대화를 안 만들었거나 실패했으면 빈 화면 대신 안내를 보여준다(§11, ep1~3 과
  // 같은 이유).
  //
  // pages.length도 같이 본다(ep2.tsx와 같은 이유) — matchReveal/personalChatPages가 다
  // 갖춰져도 전체대화(group) 메시지만 아직 비어 있을 수 있어서, 그 상태로 phase가 'group'
  // 이면 `conversation.pages[0]`이 undefined라 크래시한다(실기기 확인된 버그).
  if (
    !episode ||
    !conversation ||
    !conversation.matchReveal ||
    !conversation.personalChatPages ||
    conversation.pages.length === 0 ||
    generationLoader.isShowing
  ) {
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

  // 쪽 번호가 쪽 수를 넘는 일은 없지만(흐름이 마지막 쪽에서 멈춘다), 혹시 넘어도 화면이
  // 죽지 않게 마지막 쪽으로 잘라 읽는다.
  const groupPage = conversation.pages[Math.min(flow.groupPageIndex, conversation.pages.length - 1)];
  const personalPage =
    conversation.personalChatPages[
      Math.min(flow.personalPageIndex, conversation.personalChatPages.length - 1)
    ];
  const partner = findPersonalChatPartner(conversation.personalChatPages, conversation.participants);
  const rebakeOptions = conversation.rebake
    ? conversation.participants.filter(({ id }) => conversation.rebake!.candidateIds.includes(id))
    : [];
  // 다시 보기에서는 막는다 — 다시 굽기(투표)는 막고 결과만 보여준다(사용자 결정). 다시 굽기를
  // 했던 회차라도 서버가 그 회차 대화를 다시 굽기 뒤 버전으로 바꿔 두어서(use-inferno-conversation
  // 주석), 다시 보면 최종 1:1 대화가 그대로 나온다.
  // 시즌에 한 번이라 ep2 에서 이미 썼어도 막는다(isUsedElsewhere, constants/rebake).
  const canRebake =
    conversation.rebake != null &&
    !replay.isReplay &&
    rebake.isStatusKnown &&
    !rebake.isUsed &&
    !rebake.isUsedElsewhere;
  // 피드백은 한 번 쓰는 기회라, 보낸 뒤엔 넘기지 않아서 다시 눌리지 않게 한다(ep2 와 같다).
  const handleFeedbackPress = flow.isFeedbackUsed ? undefined : flow.handleFeedbackOpen;

  return (
    <InfernoEpisodeFrame
      episode={episode}
      // 투표지·피드백만 쪽지 바탕이고, 나머지는 흰 바탕을 그대로 쓴다.
      surface={flow.phase === 'rebakeVote' || flow.phase === 'feedback' ? 'note' : 'plain'}
      skipLabel="잠시 나가기"
      onPreviousPress={flow.goPrevious}
      onNextPress={flow.goNext}
      onSkipPress={handleExitPress}
    >
      {flow.phase === 'group' ? (
        /* 쪽이 바뀌면 타자를 처음부터 다시 치도록 key 로 갈아 끼운다. */
        <InfernoChatScene
          key={groupPage.id}
          page={groupPage}
          participants={conversation.participants}
          onPageDone={flow.handleLineDone}
        />
      ) : null}

      {flow.phase === 'personal' || flow.phase === 'rebakeChat' ? (
        // rebakeChat 은 다시 굽기 뒤 서버가 바꿔 준 새 1:1 대화다(use-inferno-ep4-flow 주석).
        // 다시 굽기로 고른 상대와 대화하는 동안은 "다시 굽기" 가 선택된 모양으로 흐려진다
        // (시안 5467:5876) — 들어올 때 이미 썼다고 나온 경우(rebake.isUsed)도 마찬가지다.
        <InfernoPersonalChatScene
          key={`${flow.phase}-${personalPage.id}`}
          page={personalPage}
          participants={conversation.participants}
          partner={partner}
          onPageDone={flow.handleLineDone}
          onRebakePress={flow.phase === 'personal' && canRebake ? flow.handleRebakeOpen : undefined}
          isRebakeSelected={flow.phase === 'rebakeChat' || rebake.isUsed}
          likedMessageIds={conversation.likedMessageIds}
          onMessageLikePress={handleMessageLikePress}
          onFeedbackPress={handleFeedbackPress}
          isFeedbackUsed={flow.isFeedbackUsed}
        />
      ) : null}

      {flow.phase === 'rebakeVote' ? (
        <InfernoVoteScene
          title="REBAKE"
          message={conversation.rebake?.voteMessage ?? ''}
          options={rebakeOptions}
          selectedId={flow.rebakeSelectedId}
          onSelect={flow.handleRebakeSelect}
          onSubmit={handleRebakeSubmit}
        />
      ) : null}

      {flow.phase === 'rebakeWaiting' ? (
        // 새 대화를 만드는 동안은 줄넘기 로더, 실패하면 "대화를 만들지 못했어요" + "다시 시도".
        <InfernoEpisodeStatus
          isError={false}
          isLoading={rebake.isWaiting}
          hasGenerationFailed={rebake.hasFailed}
          onRetry={rebake.retry}
          isLoaderShowing={rebakeLoader.isShowing}
          onLoaderExitComplete={rebakeLoader.handleExitComplete}
        />
      ) : null}

      {flow.phase === 'feedback' ? (
        <InfernoFeedbackScene
          step={flow.feedback.step}
          topics={conversation.feedbackTopics ?? []}
          selectedMessageId={flow.feedback.selectedTopicId}
          shownTopic={flow.feedback.shownTopic}
          feedback={flow.feedback.feedback}
          onSelectTopic={flow.feedback.handleTopicSelect}
          onFindPress={flow.feedback.handleTopicFind}
          onWriteStartPress={flow.feedback.handleWriteStart}
          onFeedbackChange={flow.feedback.handleFeedbackChange}
          onSubmitPress={flow.handleFeedbackSubmit}
          isSubmitting={flow.feedback.isSubmitting}
          errorMessage={flow.feedback.submitError}
        />
      ) : null}

      <InfernoEp4Modals
        openModal={flow.openModal}
        matchReveal={conversation.matchReveal}
        rebakeConfirmMessage={conversation.rebake?.confirmMessage ?? ''}
        rebakeConfirmActionLabel={conversation.rebake?.confirmActionLabel ?? ''}
        onClose={flow.handleModalClose}
        onRevealAction={flow.handleRevealAction}
        onRebakeStart={flow.handleRebakeStart}
        onFinishEpisode={finishEpisode}
        onFeedbackStart={flow.handleFeedbackStart}
        onFeedbackDone={flow.handleFeedbackDone}
      />
    </InfernoEpisodeFrame>
  );
}
