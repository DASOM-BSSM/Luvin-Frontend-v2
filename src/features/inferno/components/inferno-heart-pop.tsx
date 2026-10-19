import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** 0 에서 이 크기까지 커졌다가 1 로 돌아온다. */
const POP_OVERSHOOT_SCALE = 1.35;
/** 커지는 시간(ms). */
const POP_GROW_MS = 160;
/** 1 로 돌아오며 통통 튀는 스프링. */
const POP_SETTLE_SPRING = { damping: 8, stiffness: 260 };

interface InfernoHeartPopProps {
  children: ReactNode;
  /**
   * 나타날 때 튀어나올지. 사용자가 방금 눌러서 생긴 하트만 튀고, 이미 눌려 있던 하트(다시 보기,
   * 쪽 넘김)나 데이터에 박힌 하트는 그냥 그 자리에 있다.
   */
  shouldPop: boolean;
}

/**
 * 인스타그램 DM 에서 하트 반응을 달 때처럼, 하트가 0 에서 커지며 살짝 넘쳤다가 제 크기로
 * 통 하고 앉는 연출(사용자 요청).
 */
export default function InfernoHeartPop({ children, shouldPop }: InfernoHeartPopProps) {
  const scale = useSharedValue(shouldPop ? 0 : 1);

  useEffect(() => {
    if (!shouldPop) {
      return;
    }

    scale.value = withSequence(
      withTiming(POP_OVERSHOOT_SCALE, { duration: POP_GROW_MS, easing: Easing.out(Easing.quad) }),
      withSpring(1, POP_SETTLE_SPRING),
    );
  }, [shouldPop, scale]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={popStyle}>{children}</Animated.View>;
}
