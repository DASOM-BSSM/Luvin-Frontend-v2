import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import theme from '@/src/constants/theme';
import { bakeRevealLayout } from '@/src/constants/typography';
import InfernoBakeAnchor from '@/src/features/inferno/components/inferno-bake-anchor';
import { getGlow } from '@/src/features/inferno/utils/bake-timing';

const GRADIENT_ID = 'bake-glow';

/** 줄 가운데 기준점(InfernoBakeAnchor)에 빛의 가운데를 맞춘다. */
const centerStyle = {
  position: 'absolute' as const,
  left: -bakeRevealLayout.glow.width / 2,
  top: -bakeRevealLayout.glow.height / 2,
  width: bakeRevealLayout.glow.width,
  height: bakeRevealLayout.glow.height,
};

interface InfernoBakeGlowProps {
  time: SharedValue<number>;
}

/**
 * 두 반죽 뒤의 은은한 빛(노랑 → 분홍). 그림 자산이 아니라 색 토큰으로 그린 그라데이션 타원이다.
 * SVG 는 한 번만 그리고 바깥 뷰의 투명도·크기만 바꾼다(Android 가 SVG 를 매 프레임 다시 그리지 않게).
 */
export default function InfernoBakeGlow({ time }: InfernoBakeGlowProps) {
  const glowStyle = useAnimatedStyle(() => {
    const glow = getGlow(time.value);
    return { opacity: glow.opacity, transform: [{ scale: glow.scale }] };
  });

  return (
    <InfernoBakeAnchor>
      <Animated.View style={[centerStyle, glowStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id={GRADIENT_ID} cx="50%" cy="50%" r="50%">
              <Stop offset={0} stopColor={theme.yellow[400]} stopOpacity={1} />
              <Stop offset={0.45} stopColor={theme.pink[400]} stopOpacity={1} />
              <Stop offset={0.7} stopColor={theme.pink[400]} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${GRADIENT_ID})`} />
        </Svg>
      </Animated.View>
    </InfernoBakeAnchor>
  );
}
