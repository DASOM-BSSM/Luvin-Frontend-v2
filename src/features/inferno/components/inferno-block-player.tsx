/** [DRAFT] Presentation-only renderer. Narrative state lives outside the player. */
import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoChoiceScene from '@/src/features/inferno/components/inferno-choice-scene';
import InfernoGroupScene from '@/src/features/inferno/components/inferno-group-scene';
import InfernoInterviewScene from '@/src/features/inferno/components/inferno-interview-scene';
import InfernoMessengerScene from '@/src/features/inferno/components/inferno-messenger-scene';
import InfernoNarrationLine from '@/src/features/inferno/components/inferno-narration-line';
import InfernoTransitionScene from '@/src/features/inferno/components/inferno-transition-scene';
import { INTERVIEW_QUESTIONS } from '@/src/features/inferno/constants/episode-copy';
import type {
  ChoiceHistory,
  ChoiceOutcome,
  StoryBlock,
  StoryParticipant,
} from '@/src/features/inferno/types/story';
import { hasRejected } from '@/src/features/inferno/utils/story-playlist';

export default function InfernoBlockPlayer({
  block,
  line,
  cast,
  choices,
  recorded,
  readOnly,
  pending,
  pendingId,
  onDone,
  onNext,
  onSelect,
}: {
  block: StoryBlock;
  line: number;
  /** 회차에 나오는 빵 전부. 선택 카드가 이름·그림을 찾는다. */
  cast: StoryParticipant[];
  /** 시즌 선택 기록. 인터뷰 질문을 고른다. */
  choices: ChoiceHistory[];
  recorded?: ChoiceOutcome;
  readOnly: boolean;
  pending: boolean;
  pendingId?: string | null;
  onDone: () => void;
  onNext: () => void;
  onSelect: (id: string | null) => void;
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
        pendingId={pendingId}
        onSelect={onSelect}
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
        message={message}
        onDone={onDone}
      />
    );
  if (block.type === 'interview') {
    const participant =
      block.participants.find((person) => person.id === block.breadId) ??
      block.participants.find((person) => person.id === message.participantId);
    if (participant)
      return (
        <InfernoInterviewScene
          question={
            hasRejected(choices, block.breadId)
              ? INTERVIEW_QUESTIONS.rejected
              : INTERVIEW_QUESTIONS.default
          }
          participant={participant}
          message={message}
          onDone={onDone}
        />
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
