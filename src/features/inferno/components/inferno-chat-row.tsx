import { View } from 'react-native';

import PersonDoughCharacter from '@/src/assets/images/PersonDoughCharacter';
import TypewriterText from '@/src/components/ui/typewriter-text';
import InfernoChatBubble from '@/src/features/inferno/components/inferno-chat-bubble';
import { findDoughFigure } from '@/src/features/inferno/constants/dough-figures';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoChatRowProps {
  message: InfernoChatMessage;
  /** message.participantId 가 가리키는 반죽. 그림과 말풍선 색이 여기서 나온다. */
  participant: InfernoParticipant;
  /** 이 줄이 다 쳐졌을 때 알린다. 다음 줄을 띄우는 신호. */
  onTypingDone?: () => void;
}

/**
 * 대화 한 줄. 반죽과 말풍선이 나란히 서고, 반죽은 말풍선 바깥쪽에 붙는다.
 *
 * 줄 높이를 따로 정하지 않는 이유: 반죽이 말풍선보다 늘 커서 줄 높이가 반죽 높이로 정해지고,
 * 그래야 시안처럼 줄 사이 간격 없이 붙여 쌓아도 전체 높이가 맞는다(1쪽 59+72+65=196,
 * 2쪽 67+59+72=198).
 */
export default function InfernoChatRow({
  message,
  participant,
  onTypingDone,
}: InfernoChatRowProps) {
  const figure = findDoughFigure(participant.type);
  const isRight = message.side === 'right';

  const avatar = (
    <PersonDoughCharacter
      type={participant.type}
      className={figure.chatSizeClass}
      accessibilityLabel={participant.name}
    />
  );

  return (
    <View
      className={`w-full flex-row items-center ${isRight ? 'justify-end' : ''} ${figure.chatGapClass}`}
    >
      {isRight ? null : avatar}
      <InfernoChatBubble side={message.side} isMine={participant.isMine}>
        <TypewriterText
          text={message.text}
          variant="body-m"
          className="text-text-primary"
          onDone={onTypingDone}
        />
      </InfernoChatBubble>
      {isRight ? avatar : null}
    </View>
  );
}
