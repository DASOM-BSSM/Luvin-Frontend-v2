import { router } from 'expo-router';

import { EP4_REBAKE_PARTNER_ID } from '@/src/features/inferno/api/conversation';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoEp4Modals from '@/src/features/inferno/components/inferno-ep4-modals';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeStatus from '@/src/features/inferno/components/inferno-episode-status';
import InfernoPersonalChatScene from '@/src/features/inferno/components/inferno-personal-chat-scene';
import InfernoVoteScene from '@/src/features/inferno/components/inferno-vote-scene';
import useEpisodeCheckpoint from '@/src/features/inferno/hooks/use-episode-checkpoint';
import useEpisodeReplay from '@/src/features/inferno/hooks/use-episode-replay';
import useGenerationLoader from '@/src/features/inferno/hooks/use-generation-loader';
import useInfernoConversation from '@/src/features/inferno/hooks/use-inferno-conversation';
import useInfernoEp4Flow from '@/src/features/inferno/hooks/use-inferno-ep4-flow';
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
 * 투표해 새 1:1 대화로 넘어갈 수 있다 — 둘 중 어느 쪽이든 대화 문구는 같다
 * (EP4_REBAKE_PARTNER_ID 주석 참고). "나의 빵에게" 피드백으로 빠지는 시안은 아직 없어서
 * 그 버튼은 눌러도 아무 일도 하지 않는다.
 *
 * "다시 굽기"는 API 연동 범위 밖이다 — 새 1:1 대화가 어떤 응답으로 내려오는지 알 방법이
 * 없어서(use-inferno-conversation 주석 참고) `conversation.rebake` 가 항상 undefined 고,
 * 그래서 아래에서 onRebakePress 를 안 넘긴다 — 폴더는 보통 모양 그대로 두고 눌러도 아무 일도
 * 하지 않는다. 폴더가 흐려지는 건 다시 굽기로 고른 상대와 대화 중일 때뿐이다("선택됨" 표시,
 * InfernoPersonalChatSidebar 주석 참고).
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
  const flow = useInfernoEp4Flow(conversation, checkpoint.initialStep);

  // "잠시 나가기" 는 스킵과 다르다. 회차를 본 것으로 치지 않고, 보던 자리만 기억해 둔다.
  function handleExitPress() {
    checkpoint.saveStep(flow.step);
    router.dismissTo('/');
  }

  // 완료 쪽지의 "에피소드 끝내기". 회차를 끝내고 ep1~3 과 같이 홈으로 돌려보낸다.
  //
  // 쪽지를 먼저 닫는 이유: RN `Modal` 은 내비게이션 스택과 무관하게 항상 최상단에 그려지는
  // 네이티브 오버레이라, 화면이 언마운트되기 전에 닫지 않으면 다음 화면 위에 잠깐 남을 수 있다.
  function finishEpisode() {
    flow.handleModalClose();
    completeEpisode(EPISODE_ORDER);
    router.dismissTo('/');
  }

  // rebake 는 일부러 뺀다(위 주석 참고) — matchReveal/personalChatPages 만 갖추면 되고,
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
  const rebakePage = { id: 'ep4-rebake', messages: conversation.rebake?.chatMessages ?? [] };
  const rebakeOptions = conversation.rebake
    ? conversation.participants.filter(({ id }) => conversation.rebake!.candidateIds.includes(id))
    : [];
  const rebakeSelected = conversation.participants.find(({ id }) => id === flow.rebakeSelectedId);

  // rebakeChat 은 상대가 투표로 정해지므로, 고른 참가자를 자리표시자 id 로 감싸 끼운다.
  const rebakeChatParticipants = rebakeSelected
    ? [
        ...conversation.participants.filter(({ isMine }) => isMine),
        { ...rebakeSelected, id: EP4_REBAKE_PARTNER_ID },
      ]
    : conversation.participants;

  return (
    <InfernoEpisodeFrame
      episode={episode}
      // 투표지만 ep1 투표지와 같은 쪽지 바탕이고, 나머지는 흰 바탕을 그대로 쓴다.
      surface={flow.phase === 'rebakeVote' ? 'note' : 'plain'}
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

      {flow.phase === 'personal' ? (
        <InfernoPersonalChatScene
          key={personalPage.id}
          page={personalPage}
          participants={conversation.participants}
          partner={findPersonalChatPartner(conversation.personalChatPages, conversation.participants)}
          onPageDone={flow.handleLineDone}
          // rebake 가 없으면 넘기지 않는다 — 눌러도 아무 일도 하지 않는다(위 화면 주석,
          // InfernoPersonalChatSidebar 참고). 흐려지지는 않는다 — 아직 다시 굽기를 고르지 않았다.
          // 다시 보기에서도 넘기지 않는다 — 다시 굽기(투표)는 막고 결과만 보여준다(사용자 결정).
          // 다시 굽기를 했던 회차라도 서버가 그 회차 대화를 다시 굽기 뒤 버전으로 바꿔 두어서
          // (use-inferno-conversation 주석), 다시 보면 최종 1:1 대화가 그대로 나온다.
          onRebakePress={conversation.rebake && !replay.isReplay ? flow.handleRebakeOpen : undefined}
        />
      ) : null}

      {flow.phase === 'rebakeVote' ? (
        <InfernoVoteScene
          title="REBAKE"
          message={conversation.rebake?.voteMessage ?? ''}
          options={rebakeOptions}
          selectedId={flow.rebakeSelectedId}
          onSelect={flow.handleRebakeSelect}
          onSubmit={flow.handleRebakeSubmit}
        />
      ) : null}

      {flow.phase === 'rebakeChat' ? (
        <InfernoPersonalChatScene
          page={rebakePage}
          participants={rebakeChatParticipants}
          partner={findPersonalChatPartner([rebakePage], rebakeChatParticipants)}
          onPageDone={flow.handleLineDone}
          // 다시 굽기를 골라 들어온 대화라 "다시 굽기" 가 선택된 모양으로 흐려진다(시안 5467:5876).
          // onRebakePress 는 안 넘긴다 — 다시 굽기는 한 회차에 한 번만 쓸 수 있다.
          isRebakeSelected
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
      />
    </InfernoEpisodeFrame>
  );
}
