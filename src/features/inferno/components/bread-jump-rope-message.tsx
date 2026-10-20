import { useEffect, useState } from 'react';
import Animated, { Easing, FadeOut, withDelay, withTiming } from 'react-native-reanimated';

import Text from '@/src/components/ui/text';
import {
  JUMP_ROPE_MESSAGE_INTERVAL_MS,
  JUMP_ROPE_MESSAGE_TRANSITION,
  JUMP_ROPE_MESSAGES,
} from '@/src/features/inferno/constants/jump-rope';
import { shuffleMessageOrder } from '@/src/features/inferno/utils/jump-rope-timing';

interface MessageCursor {
  order: number[];
  position: number;
}

function createCursor(avoidFirst?: number): MessageCursor {
  return {
    order: shuffleMessageOrder(JUMP_ROPE_MESSAGES.length, Math.random, avoidFirst),
    position: 0,
  };
}

/** 다음 문구로 넘긴다. 목록을 다 돌았으면 다시 섞되 방금 문구가 바로 오지 않게 한다. */
function advanceCursor(cursor: MessageCursor): MessageCursor {
  const next = cursor.position + 1;
  if (next < cursor.order.length) {
    return { ...cursor, position: next };
  }
  return createCursor(cursor.order[cursor.position]);
}

/** 새 문구: 살짝 아래에서 떠오르며 나타난다. */
function messageEntering() {
  'worklet';
  const { enterDelayMs, enterMs, riseDistance } = JUMP_ROPE_MESSAGE_TRANSITION;
  const timing = { duration: enterMs, easing: Easing.out(Easing.cubic) };
  return {
    initialValues: { opacity: 0, transform: [{ translateY: riseDistance }] },
    animations: {
      opacity: withDelay(enterDelayMs, withTiming(1, timing)),
      transform: [{ translateY: withDelay(enterDelayMs, withTiming(0, timing)) }],
    },
  };
}

const messageExiting = FadeOut.duration(JUMP_ROPE_MESSAGE_TRANSITION.exitMs);

/** 바뀌는 동안 이전·새 문구가 같은 자리에 겹쳐 있어야 해서 둘 다 띄워 가운데 정렬한다. */
const messageSlotStyle = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  alignItems: 'center' as const,
};

/** 쪽지 위쪽 문구. 5초마다 목록에서 겹치지 않게 하나씩 바꿔 보여 준다. */
export default function BreadJumpRopeMessage() {
  const [cursor, setCursor] = useState(() => createCursor());
  const messageIndex = cursor.order[cursor.position];

  function handleMessageTick() {
    setCursor(advanceCursor);
  }

  useEffect(() => {
    const timer = setInterval(handleMessageTick, JUMP_ROPE_MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // key 가 바뀌면 이전 문구는 exiting, 새 문구는 entering 애니메이션을 탄다.
  // 움직이는 뷰라 className 대신 style 만 쓴다(줄넘기 다른 뷰들과 같은 이유).
  return (
    <Animated.View
      key={`${messageIndex}-${cursor.position}`}
      style={messageSlotStyle}
      entering={messageEntering}
      exiting={messageExiting}
    >
      <Text variant="body-s" className="text-text-muted" accessibilityLiveRegion="polite">
        {JUMP_ROPE_MESSAGES[messageIndex]}
      </Text>
    </Animated.View>
  );
}
