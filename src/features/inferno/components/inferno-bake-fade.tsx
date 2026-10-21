import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getRevealOpacity, getWaitMessageOpacity } from '@/src/features/inferno/utils/bake-timing';

interface InfernoBakeFadeProps {
  time: SharedValue<number>;
  /** reveal: 빵이 된 뒤 나타난다(기본). wait: 기다리는 동안 보이다가 리포트가 오면 사라진다. */
  kind?: 'reveal' | 'wait';
  children: ReactNode;
}

/**
 * ep5 1페이지의 제목·하트·이름을 굽기 연출 동안 숨겨 두고, 빵이 자리를 잡은 뒤 나타나게 한다.
 * 처음부터 자리는 차지한 채 투명도만 바꿔서(RiseIn 과 같은 이유) 나타날 때 다른 요소가 밀리지 않는다.
 * `kind="wait"` 는 거꾸로 리포트 대기 문구를 기다리는 동안 보여 주고 리포트가 오면 걷는다.
 */
export default function InfernoBakeFade({ time, kind = 'reveal', children }: InfernoBakeFadeProps) {
  const isWait = kind === 'wait';
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: isWait ? getWaitMessageOpacity(time.value) : getRevealOpacity(time.value),
  }));

  return <Animated.View style={fadeStyle}>{children}</Animated.View>;
}
