/** [DRAFT] Presentation-only renderer. Narrative state lives outside the player. */
import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoChoiceScene from '@/src/features/inferno/components/inferno-choice-scene';
import InfernoGroupScene from '@/src/features/inferno/components/inferno-group-scene';
import InfernoInterviewScene from '@/src/features/inferno/components/inferno-interview-scene';
import InfernoMessengerScene from '@/src/features/inferno/components/inferno-messenger-scene';
import InfernoPairScene from '@/src/features/inferno/components/inferno-pair-scene';
import InfernoNarrationLine from '@/src/features/inferno/components/inferno-narration-line';
import InfernoTransitionScene from '@/src/features/inferno/components/inferno-transition-scene';
import type { AiCharacterWithDescription } from '@/src/features/inferno/api/story-types';
import type {
  ChoiceHistory,
  ChoiceOutcome,
  StageCastMember,
  StoryBlock,
  StoryParticipant,
} from '@/src/features/inferno/types/story';
import { isPairWithPartner } from '@/src/features/inferno/utils/story-playlist';

export default function InfernoBlockPlayer({
  order,
  block,
  line,
  likedMessageIds,
  feedbacks,
  cast,
  stageCast,
  characters,
  choices,
  recorded,
  readOnly,
  pending,
  onDone,
  onNext,
  onSelect,
  onChoiceNext,
  onLeave,
  ended,
  onChoiceModalDismiss,
}: {
  order: number;
  block: StoryBlock;
  line: number;
  /** 1:1 장면 좋아요·피드백 복원용(본문 응답의 likedMessageIds·feedbacks). */
  likedMessageIds: string[];
  feedbacks: Record<string, string>;
  /** 회차에 나오는 빵 전부. 선택 카드가 이름·그림을 찾는다. */
  cast: StoryParticipant[];
  /** 시즌 단위로 저장한 1화 무대 소개 출연진. 전체대화 반죽 소개 모달이 쓴다(use-season-cast). */
  stageCast: StageCastMember[];
  /** 서버 시즌 출연진. 반죽 소개 특징 문구의 첫 번째 출처. */
  characters: AiCharacterWithDescription[];
  /** 시즌 선택 기록. 인터뷰 질문을 고른다. */
  choices: ChoiceHistory[];
  recorded?: ChoiceOutcome;
  readOnly: boolean;
  pending: boolean;
  onDone: () => void;
  onNext: () => void;
  onSelect: (id: string | null) => void;
  /** 이미 투표한 결과 모달의 "다음으로". 투표 뒤에는 회차를 끝낸다(use-episode-playback). */
  onChoiceNext: () => void;
  /** 회차에서 나간다(이미 끝낸 회차의 투표 결과 모달 "에피소드 나가기"). */
  onLeave: () => void;
  /** 회차가 끝나 종료 모달을 띄울 차례. 선택 장면의 모달을 먼저 닫게 한다. */
  ended: boolean;
  /** 선택 장면의 모달이 완전히 닫혔을 때(iOS). */
  onChoiceModalDismiss: () => void;
}) {
  if (block.type === 'transition')
    return <InfernoTransitionScene text={block.text} onNext={onNext} />;
  if (block.type === 'choice')
    return (
      <InfernoChoiceScene
        choice={block.choice}
        participants={cast}
        recorded={recorded}
        readOnly={readOnly}
        pending={pending}
        onSelect={onSelect}
        onNext={onChoiceNext}
        onLeave={onLeave}
        ended={ended}
        onModalDismiss={onChoiceModalDismiss}
      />
    );
  if (block.type === 'pair' && isPairWithPartner(block))
    return (
      <InfernoPairScene
        order={order}
        block={block}
        likedMessageIds={likedMessageIds}
        feedbacks={feedbacks}
        onDone={onDone}
      />
    );
  const message = block.messages[line];
  if (!message) return <Text variant="body-m">대화가 없어요. 다음 화면으로 이동해주세요.</Text>;
  if (block.type === 'messenger')
    return <InfernoMessengerScene block={block} index={line} onDone={onDone} />;
  if (message.kind === 'narration') return <InfernoNarrationLine text={message.text} onDone={onDone} />;
  if (block.type === 'group')
    return (
      <InfernoGroupScene
        id={block.id}
        participants={block.participants}
        episodeCast={cast}
        message={message}
        stageCast={stageCast}
        characters={characters}
        onDone={onDone}
      />
    );
  if (block.type === 'interview') {
    // 질문은 내 빵에 대해 묻고, 답은 인터뷰 대상 빵(breadId)이 한다(Figma 7884:4592).
    const subject =
      block.participants.find((person) => person.isMine) ?? cast.find((person) => person.isMine);
    const answerer =
      block.participants.find((person) => person.id === block.breadId) ??
      block.participants.find((person) => person.id === message.participantId);
    if (subject && answerer)
      return (
        <InfernoInterviewScene subject={subject} answerer={answerer} message={message} onDone={onDone} />
      );
  }
  return (
    <InfernoChatScene
      page={{ id: block.id, messages: [message] }}
      participants={block.participants}
      onPageDone={onDone}
    />
  );
}
