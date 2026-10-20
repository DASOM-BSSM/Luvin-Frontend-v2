import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getRevealOpacity } from '@/src/features/inferno/utils/bake-timing';

interface InfernoBakeFadeProps {
  time: SharedValue<number>;
  children: ReactNode;
}

/**
 * ep5 RESULT 의 제목·하트·이름을 등장 연출 동안 숨겨 두고, 빵이 자리를 잡은 뒤 나타나게 한다.
 * 처음부터 자리는 차지한 채 투명도만 바꿔서(RiseIn 과 같은 이유) 나타날 때 다른 요소가 밀리지 않는다.
 */
export default function InfernoBakeFade({ time, children }: InfernoBakeFadeProps) {
  const fadeStyle = useAnimatedStyle(() => ({ opacity: getRevealOpacity(time.value) }));

  return <Animated.View style={fadeStyle}>{children}</Animated.View>;
}
