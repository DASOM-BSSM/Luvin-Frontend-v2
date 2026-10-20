import { useState } from 'react';
import { Pressable, View } from 'react-native';

import HeartBadgeIcon from '@/src/assets/icons/HeartBadgeIcon';
import TypewriterText from '@/src/components/ui/typewriter-text';
import theme from '@/src/constants/theme';
import InfernoChatBubble from '@/src/features/inferno/components/inferno-chat-bubble';
import InfernoHeartPop from '@/src/features/inferno/components/inferno-heart-pop';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';

interface InfernoPersonalChatLineProps {
  message: InfernoChatMessage;
  participant: InfernoParticipant;
  /** 이 줄이 다 쳐졌는지. 다 쳐지기 전에는 하트를 누를 수도, 볼 수도 없다. */
  isTyped: boolean;
  /** 이 줄에 하트를 눌렀는지. */
  isLiked: boolean;
  /** 이 줄이 다 쳐졌을 때 알린다. 지금 쳐지고 있는 줄만 넘긴다. */
  onTypingDone?: () => void;
  /** 말풍선을 눌렀을 때. 넘기지 않으면 하트를 누를 수 없다. */
  onLikePress?: (messageId: string) => void;
}

/**
 * 1:1 대화 한 줄. 말풍선을 누르면 하트가 켜지고, 다시 누르면 꺼진다(ep2·ep4 1:1 대화에서만).
 *
 * 하트는 말풍선 왼쪽 아래에 걸쳐 앉는다 — 시안(`ep2-대화 끝` 5467:5765, `ep4-끝` 5467:5693)에서
 * 말풍선 위에서 38, 왼쪽에서 13. 데이터에 미리 박힌 하트(`showHeart`)도 같은 자리에 같은 모양이다.
 * 오른쪽에 붙는 말풍선(내 말)은 하트도 오른쪽 아래(오른쪽에서 13)에 앉는다(사용자 요청).
 *
 * 하트 알약 배경은 말풍선 색을 따라간다(사용자 요청) — 내 말이면 pink/400, 상대 말이면 pink/200
 * (InfernoChatBubble 의 pink 짝과 같다).
 */
export default function InfernoPersonalChatLine({
  message,
  participant,
  isTyped,
  isLiked,
  onTypingDone,
  onLikePress,
}: InfernoPersonalChatLineProps) {
  const isRight = message.side === 'right';
  const isHeartShown = isTyped && (isLiked || message.showHeart === true);

  // 이 화면에서 직접 눌러 켠 하트만 튀어나오게 한다(InfernoHeartPop 주석 참고).
  const [hasPressedLike, setHasPressedLike] = useState(false);

  function handleBubblePress() {
    setHasPressedLike(true);
    onLikePress?.(message.id);
  }

  return (
    <View className={`w-full flex-col ${isRight ? 'items-end' : 'items-start'}`}>
      <View className={`w-full flex-row ${isRight ? 'justify-end' : 'justify-start'}`}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLiked ? '하트 취소' : '하트 누르기'}
          accessibilityState={{ selected: isLiked }}
          disabled={!isTyped || !onLikePress}
          className="shrink"
          onPress={handleBubblePress}
        >
          <InfernoChatBubble side={message.side} isMine={participant.isMine} palette="pink">
            <TypewriterText
              text={message.text}
              variant="body-m"
              className="text-text-primary"
              onDone={onTypingDone}
            />
          </InfernoChatBubble>
        </Pressable>
      </View>
      {isHeartShown ? (
        <View className={`-mt-[8px] ${isRight ? 'pr-[13px]' : 'pl-[13px]'}`}>
          <InfernoHeartPop shouldPop={hasPressedLike}>
            <HeartBadgeIcon backgroundColor={participant.isMine ? theme.pink[400] : theme.pink[200]} />
          </InfernoHeartPop>
        </View>
      ) : null}
    </View>
  );
}
