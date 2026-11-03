import { View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import BreadCharacter, { type BreadType } from '@/src/assets/images/BreadCharacter';
import { getFigurePose } from '@/src/features/inferno/utils/bake-timing';

/** 반죽 그림과 구운 빵 그림을 같은 칸에 겹쳐 둔다. */
const layerStyle = { position: 'absolute' as const, left: 0, top: 0, right: 0, bottom: 0 };

interface InfernoBakeFigureProps {
  type: BreadType;
  /** 1페이지와 같은 칸 크기(dough-figures.ts 의 chatSizeClass). 연출과 1페이지가 이 값 하나를 같이 쓴다. */
  sizeClass: string;
  /** 왼쪽 -1, 오른쪽 1. 바깥쪽에서 다가온다. */
  side: -1 | 1;
  time: SharedValue<number>;
  accessibilityLabel?: string;
}

/**
 * ep5 굽기 연출의 한 마리. 반죽으로 다가와서 연기 뒤에서 구운 빵으로 바뀐다. 상대는 연기 뒤에서 빵이 되는
 * 순간부터 그려져서 빵 모습으로만 나온다(bake-timing 의 getFigurePose).
 *
 * 칸 크기는 움직이지 않는 안쪽 View 가 정하고(1페이지와 같은 className), 움직임은 transform 만 쓴다. 그래서
 * 연출 중에도 칸 자리는 1페이지와 같고, 연출이 끝나 transform 이 제자리로 돌아오면 1페이지와 똑같다.
 */
// 움직이는 뷰에는 className 을 달지 않는다(bread-jump-rope-jumper 와 같은 이유 — Android 프레임 저하).
export default function InfernoBakeFigure({
  type,
  sizeClass,
  side,
  time,
  accessibilityLabel,
}: InfernoBakeFigureProps) {
  const poseStyle = useAnimatedStyle(() => {
    const pose = getFigurePose(time.value, side);
    return {
      transform: [
        { translateX: pose.x },
        { translateY: pose.y },
        { rotate: `${pose.rotateDeg}deg` },
        { scaleX: pose.scaleX },
        { scaleY: pose.scaleY },
      ],
    };
  });
  const doughStyle = useAnimatedStyle(() => ({
    opacity: getFigurePose(time.value, side).doughOpacity,
  }));
  const breadStyle = useAnimatedStyle(() => ({
    opacity: getFigurePose(time.value, side).breadOpacity,
  }));

  return (
    <Animated.View style={[{ transformOrigin: '50% 100%' }, poseStyle]}>
      <View className={sizeClass} accessibilityLabel={accessibilityLabel}>
        <Animated.View style={[layerStyle, doughStyle]}>
          <BreadCharacter type={type} state="personDough" className="h-full w-full" transition={0} />
        </Animated.View>
        <Animated.View style={[layerStyle, breadStyle]}>
          <BreadCharacter type={type} state="baked" className="h-full w-full" transition={0} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}
