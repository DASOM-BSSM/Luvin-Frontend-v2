import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import BreadCharacter, {
  type BreadState,
  type BreadType,
} from '@/src/assets/images/BreadCharacter';

/** 뛰어오르는 높이(px). 빵 크기가 달라도 같은 값을 쓴다. */
const JUMP_HEIGHT = 9;

/** 올라가는 시간. 중력처럼 보이도록 내려오는 것보다 느리다. */
const JUMP_UP_MS = 260;

/** 내려오는 시간. */
const JUMP_DOWN_MS = 200;

/** 한 번 뛴 뒤 쉬는 시간. 이게 있어야 계속 들썩이지 않고 이따금 뛰는 느낌이 난다. */
const JUMP_REST_MS = 1100;

/** 통 튀어나올 때의 스프링. 감쇠를 낮게 둬서 한두 번 출렁이다 멈춘다. */
const POP_SPRING = { damping: 8, stiffness: 170, mass: 0.8 };

/** 스프링이 거의 멈추기까지 걸리는 시간. 이 뒤에 뛰기 시작해야 두 움직임이 겹치지 않는다. */
export const POP_SETTLE_MS = 700;

interface JumpingBreadProps {
  type: BreadType;
  state: BreadState;
  className: string;
  jumpDelayMs: number;
  jumpSpeed: number;
  jumping: boolean;
  /** 주면 이 시간 뒤에 크기 0 에서 통 튀어나오고, 다 나온 뒤에 뛰기 시작한다. 없으면 처음부터 보인다. */
  popInDelayMs?: number;
}

/**
 * 빵 한 마리. jumping 이면 제 타이밍으로 계속 뛴다.
 *
 * 공중에 있는 동안 세로로 살짝 늘려 준다. 이게 없으면 그림이 위아래로 미끄러지는 것처럼만
 * 보이고, 있으면 제 힘으로 뛰어오르는 것처럼 보인다.
 */
export default function JumpingBread({
  type,
  state,
  className,
  jumpDelayMs,
  jumpSpeed,
  jumping,
  popInDelayMs,
}: JumpingBreadProps) {
  const lift = useSharedValue(0);
  const pop = useSharedValue(popInDelayMs === undefined ? 1 : 0);

  useEffect(() => {
    if (popInDelayMs === undefined) {
      return;
    }

    pop.value = withDelay(popInDelayMs, withSpring(1, POP_SPRING));

    // 정리 없이 새 체인을 얹으면 Android 에서 공유 값이 꼬인 적이 있다(러빈지옥 인트로).
    return () => cancelAnimation(pop);
  }, [popInDelayMs, pop]);

  useEffect(() => {
    if (!jumping) {
      return;
    }

    const popEndMs = popInDelayMs === undefined ? 0 : popInDelayMs + POP_SETTLE_MS;

    lift.value = withDelay(
      popEndMs + jumpDelayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: JUMP_UP_MS / jumpSpeed, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: JUMP_DOWN_MS / jumpSpeed, easing: Easing.in(Easing.quad) }),
          withDelay(JUMP_REST_MS / jumpSpeed, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(lift);
  }, [jumping, jumpDelayMs, jumpSpeed, popInDelayMs, lift]);

  const jumpStyle = useAnimatedStyle(() => ({
    opacity: Math.min(pop.value * 2, 1),
    transform: [
      { translateY: -lift.value * JUMP_HEIGHT },
      { scale: pop.value },
      { scaleY: 1 + lift.value * 0.05 },
      { scaleX: 1 - lift.value * 0.03 },
    ],
  }));

  return (
    <Animated.View className={className} style={jumpStyle}>
      <BreadCharacter type={type} state={state} className="h-full w-full" />
    </Animated.View>
  );
}
