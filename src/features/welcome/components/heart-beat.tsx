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

import HeartIcon from '@/src/assets/icons/HeartIcon';
import { heart } from '@/src/constants/colors';

/** 두근, 두근 — 짧게 두 번 뛰고 쉰다. */
const BEAT_UP_MS = 120;
const BEAT_DOWN_MS = 160;
const BEAT_REST_MS = 700;
const BEAT_SCALE = 1.25;

interface HeartBeatProps {
  size: number;
  /** 튀어나오기 전까지 기다리는 시간. 양옆 빵이 먼저 나온 뒤에 하트가 뜨게 한다. */
  delayMs: number;
}

/** 크기 0 에서 튀어나온 뒤 계속 두근거리는 하트. 러빈지옥 소개 장에서 두 반죽 사이에 놓인다. */
export default function HeartBeat({ size, delayMs }: HeartBeatProps) {
  const enter = useSharedValue(0);
  const beat = useSharedValue(1);

  useEffect(() => {
    enter.value = withDelay(delayMs, withSpring(1, { damping: 8, stiffness: 170, mass: 0.8 }));
    beat.value = withDelay(
      delayMs + 600,
      withRepeat(
        withSequence(
          withTiming(BEAT_SCALE, { duration: BEAT_UP_MS, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: BEAT_DOWN_MS, easing: Easing.in(Easing.quad) }),
          withTiming(BEAT_SCALE, { duration: BEAT_UP_MS, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: BEAT_DOWN_MS, easing: Easing.in(Easing.quad) }),
          withDelay(BEAT_REST_MS, withTiming(1, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    // 정리 없이 새 체인을 얹으면 Android 에서 공유 값이 꼬인 적이 있다(러빈지옥 인트로).
    return () => {
      cancelAnimation(enter);
      cancelAnimation(beat);
    };
  }, [delayMs, enter, beat]);

  const heartStyle = useAnimatedStyle(() => ({
    opacity: Math.min(enter.value * 2, 1),
    transform: [{ scale: enter.value * beat.value }],
  }));

  return (
    <Animated.View style={heartStyle}>
      <HeartIcon color={heart.filled} size={size} />
    </Animated.View>
  );
}
