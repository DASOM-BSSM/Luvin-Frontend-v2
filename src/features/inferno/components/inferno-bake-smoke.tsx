import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import theme from '@/src/constants/theme';
import { bakeRevealLayout } from '@/src/constants/typography';
import InfernoBakeAnchor from '@/src/features/inferno/components/inferno-bake-anchor';
import { getPuffPose } from '@/src/features/inferno/utils/bake-timing';

/** 연기 색(`bakeRevealLayout.smokePuffs` 의 tone 순번). 흰 쪽지 위에서 보이도록 회색·연갈색을 섞었다. */
const SMOKE_TONES = [theme.default.gray, theme.brown[200], theme.brown[300]] as const;

type SmokePuffLayout = (typeof bakeRevealLayout.smokePuffs)[number];

interface SmokePuffProps {
  puff: SmokePuffLayout;
  index: number;
  time: SharedValue<number>;
}

function SmokePuff({ puff, index, time }: SmokePuffProps) {
  // 웹에서는 SVG id 가 한 문서를 같이 쓰므로 덩이마다 다르게 둔다.
  const gradientId = `bake-smoke-${index}`;
  const color = SMOKE_TONES[puff.tone];
  // 줄 가운데 기준점(InfernoBakeAnchor)에 덩이 가운데를 맞춘다.
  const frame = {
    position: 'absolute' as const,
    left: -puff.size / 2,
    top: -puff.size / 2,
    width: puff.size,
    height: puff.size,
  };

  const puffStyle = useAnimatedStyle(() => {
    const pose = getPuffPose(time.value, puff.x, puff.y, index);
    return {
      opacity: pose.opacity,
      transform: [{ translateX: pose.x }, { translateY: pose.y }, { scale: pose.scale }],
    };
  });

  return (
    <Animated.View style={[frame, puffStyle]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset={0} stopColor={color} stopOpacity={1} />
            <Stop offset={0.55} stopColor={color} stopOpacity={0.95} />
            <Stop offset={1} stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

interface InfernoBakeSmokeProps {
  time: SharedValue<number>;
}

/**
 * 두 반죽을 덮었다가 위로 흩어지는 부드러운 연기. 가장자리가 흐린 반투명 원 여러 개를 겹쳐 흐릿한 연기처럼
 * 보이게 한다(사용자 지시). 진짜 블러 필터는 쓰지 않았다 — RN 의 `filter: blur` 는 Android 에서만 되고
 * iOS 에서는 무시되며, 새 패키지(expo-blur)는 들이지 않기로 했다. 반죽 → 구운 빵 바꿔치기가 이 연기 뒤에서 일어난다.
 */
export default function InfernoBakeSmoke({ time }: InfernoBakeSmokeProps) {
  function renderPuff(puff: SmokePuffLayout, index: number) {
    return <SmokePuff key={index} puff={puff} index={index} time={time} />;
  }

  return <InfernoBakeAnchor>{bakeRevealLayout.smokePuffs.map(renderPuff)}</InfernoBakeAnchor>;
}
