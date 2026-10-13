import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import AvatarSide from '@/src/assets/images/AvatarSide';
import { jumpRopeLayout } from '@/src/constants/typography';
import { getRopePose } from '@/src/features/inferno/utils/jump-rope-math';

interface BreadJumpRopeHolderProps {
  side: 'left' | 'right';
  scale: number;
  elapsed: SharedValue<number>;
}

// 움직이는 뷰에는 className 을 달지 않는다. NativeWind(cssInterop)가 감싸면 Reanimated 스타일이
// 바뀔 때마다 JS 쪽에서 다시 그려 Android 에서 프레임이 크게 떨어진다(dino-runner 의 PlayerSprite 와 같은 이유).
/** 줄을 돌리는 아바타. 왼쪽은 여자, 오른쪽은 남자 옆모습(시안 그대로). 줄 박자에 맞춰 살짝 흔들린다. */
export default function BreadJumpRopeHolder({ side, scale, elapsed }: BreadJumpRopeHolderProps) {
  const who = side === 'left' ? 'girl' : 'boy';
  const box = jumpRopeLayout.holder[who];
  const bodyFrame = {
    position: 'absolute' as const,
    left: box.x * scale,
    top: box.y * scale,
    transformOrigin: '50% 100%',
  };
  const bodyStyle = useAnimatedStyle(() => {
    const angle = getRopePose(elapsed.value).angleDeg;
    return { transform: [{ rotate: `${side === 'left' ? angle : -angle}deg` }] };
  });

  return (
    <Animated.View style={[bodyFrame, bodyStyle]}>
      <AvatarSide who={who} width={box.width * scale} height={box.height * scale} />
    </Animated.View>
  );
}
