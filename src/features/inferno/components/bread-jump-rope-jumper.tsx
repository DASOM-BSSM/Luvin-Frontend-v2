import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import { jumpRopeLayout } from '@/src/constants/typography';
import useJumpRopeSlot from '@/src/features/inferno/hooks/use-jump-rope-slot';
import { getJumpPose } from '@/src/features/inferno/utils/jump-rope-math';
import { isJumpAfterExit } from '@/src/features/inferno/utils/jump-rope-timing';

interface BreadJumpRopeJumperProps {
  slot: number;
  scale: number;
  elapsed: SharedValue<number>;
  exitAt: SharedValue<number>;
}

/** 위치·크기는 고정하고 transform 만 매 프레임 바꾼다(레이아웃 재계산 없음). */
// 움직이는 뷰에는 className 을 달지 않는다. NativeWind(cssInterop)가 감싸면 Reanimated 스타일이
// 바뀔 때마다 JS 쪽에서 다시 그려 Android 에서 프레임이 크게 떨어진다(dino-runner 의 PlayerSprite 와 같은 이유).
export default function BreadJumpRopeJumper({
  slot,
  scale,
  elapsed,
  exitAt,
}: BreadJumpRopeJumperProps) {
  const { preparedIndex, recyclingKey, type } = useJumpRopeSlot(slot, elapsed, exitAt);
  const jumper = jumpRopeLayout.jumper;
  const bodyFrame = {
    position: 'absolute' as const,
    left: 0,
    top: (jumpRopeLayout.groundY - jumper.height) * scale,
    width: jumper.width * scale,
    height: jumper.height * scale,
    transformOrigin: '50% 100%',
  };
  const bodyStyle = useAnimatedStyle(() => {
    const pose = getJumpPose(elapsed.value, preparedIndex);
    const hidden = isJumpAfterExit(preparedIndex, exitAt.value);
    return {
      opacity: hidden ? 0 : pose.opacity,
      transform: [
        { translateX: (pose.x - jumper.width / 2) * scale },
        { translateY: -pose.y * scale },
        { rotate: `${pose.rotationDeg}deg` },
        { scaleX: pose.scaleX },
        { scaleY: pose.scaleY },
      ],
    };
  });

  return (
    <Animated.View style={[bodyFrame, bodyStyle]}>
      <BreadCharacter
        type={type}
        state="personDough"
        className="h-full w-full"
        contentPosition="bottom"
        recyclingKey={recyclingKey}
        transition={0}
      />
    </Animated.View>
  );
}
