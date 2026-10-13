import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { defaultColor, pink } from '@/src/constants/colors';
import { jumpRopeLayout } from '@/src/constants/typography';
import { getRopePose } from '@/src/features/inferno/utils/jump-rope-math';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** 안 보이는 쪽 줄은 이 값으로 고정해 매 프레임 다시 그리지 않게 한다. */
const HIDDEN_PATH = 'M 0 0';

interface BreadJumpRopeProps {
  /** true 면 반죽 앞을 지나는 줄(과 손잡이), false 면 반죽 뒤를 지나는 줄. */
  front: boolean;
  scale: number;
  elapsed: SharedValue<number>;
}

/** 줄과 분홍 손잡이. Figma `Group 13` (7219:3710): 검정 2px 선 + 양 끝 19x5 손잡이. */
export default function BreadJumpRope({ front, scale, elapsed }: BreadJumpRopeProps) {
  const rope = jumpRopeLayout.rope;
  const canvas = rope.canvas;
  const ropeProps = useAnimatedProps(() => {
    const pose = getRopePose(elapsed.value);
    return pose.front === front ? { d: pose.path, opacity: 1 } : { d: HIDDEN_PATH, opacity: 0 };
  });
  // 손잡이는 손에 쥐어져 있으니 늘 앞에 그린다.
  const handleProps = useAnimatedProps(() => ({ d: getRopePose(elapsed.value).handles }));
  const canvasStyle = {
    position: 'absolute' as const,
    left: canvas.x * scale,
    top: canvas.y * scale,
  };

  return (
    <Svg
      style={canvasStyle}
      width={canvas.width * scale}
      height={canvas.height * scale}
      viewBox={`${canvas.x} ${canvas.y} ${canvas.width} ${canvas.height}`}
    >
      <AnimatedPath
        animatedProps={ropeProps}
        fill="none"
        stroke={defaultColor.black}
        strokeWidth={rope.strokeWidth}
      />
      {front ? (
        <AnimatedPath
          animatedProps={handleProps}
          fill="none"
          stroke={pink[500]}
          strokeWidth={rope.handleWidth}
          strokeLinecap="round"
        />
      ) : null}
    </Svg>
  );
}
