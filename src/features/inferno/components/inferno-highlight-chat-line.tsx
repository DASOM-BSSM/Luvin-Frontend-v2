import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import InfernoChatBubble, {
  type InfernoChatBubblePalette,
} from '@/src/features/inferno/components/inferno-chat-bubble';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';

/** 본편 대화 아바타(최대 72px)보다 작게 고정한다 — "채팅이 너무 큰것 같다"는 피드백 반영. */
const AVATAR_CLASS = 'h-[36px] w-[60px]';

interface InfernoHighlightChatLineProps {
  message: InfernoChatMessage;
  participant: InfernoParticipant;
  palette: InfernoChatBubblePalette;
}

/**
 * [DRAFT] 하이라이트 전용 대화 한 줄.
 *
 * `InfernoChatRow`(본편)와 달리 타이핑 애니메이션 없이 이미 쓰인 문장을 그대로 보여준다 —
 * 등장 자체는 이 컴포넌트가 아니라 `InfernoHighlightScene`이 `RiseIn`으로 감싸 순서대로
 * 나타나게 한다. 아바타도 본편보다 작은 고정 크기로 줄였다.
 */
export default function InfernoHighlightChatLine({
  message,
  participant,
  palette,
}: InfernoHighlightChatLineProps) {
  const isRight = message.side === 'right';

  const avatar = (
    <BreadCharacter
      type={participant.type}
      state="personDough"
      className={AVATAR_CLASS}
      accessibilityLabel={participant.name}
    />
  );

  return (
    <View className={`w-full flex-row items-center gap-[8px] ${isRight ? 'justify-end' : ''}`}>
      {isRight ? null : avatar}
      <InfernoChatBubble side={message.side} isMine={participant.isMine} palette={palette}>
        <Text variant="body-s" className="text-text-primary">
          {message.text}
        </Text>
      </InfernoChatBubble>
      {isRight ? avatar : null}
    </View>
  );
}
