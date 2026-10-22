/** [DRAFT] Presentation-only renderer. Narrative state lives outside the player. */
import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoChoiceScene from '@/src/features/inferno/components/inferno-choice-scene';
import InfernoGroupScene from '@/src/features/inferno/components/inferno-group-scene';
import InfernoInterviewScene from '@/src/features/inferno/components/inferno-interview-scene';
import InfernoMessengerScene from '@/src/features/inferno/components/inferno-messenger-scene';
import InfernoTransitionScene from '@/src/features/inferno/components/inferno-transition-scene';
import { SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import type { ChoiceRecord, SceneBlock } from '@/src/features/inferno/types/scene-block';
export default function InfernoBlockPlayer({
  block,
  line,
  recorded,
  readOnly,
  pending,
  pendingId,
  onDone,
  onNext,
  onSelect,
}: {
  block: SceneBlock;
  line: number;
  recorded?: ChoiceRecord;
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
        participants={SCENE_CAST}
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
    const participant = block.participants.find((person) => person.id === message.participantId);
    if (participant)
      return <InfernoInterviewScene participant={participant} message={message} onDone={onDone} />;
  }
  return (
    <InfernoChatScene
      page={{ id: block.id, messages: [message] }}
      participants={block.participants}
      onPageDone={onDone}
    />
  );
}
